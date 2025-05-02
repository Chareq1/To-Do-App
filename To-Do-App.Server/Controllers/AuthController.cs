using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using To_Do_App.Server.Models;
using To_Do_App.Server.Models.Auth;
using To_Do_App.Server.Services.Interfaces;

namespace To_Do_App.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // Kontroler do obsługi autoryzacji
    public class AuthController : ControllerBase
    {
        // Usługi
        private readonly IUserService _userService;
        private readonly IAvatarService _avatarService;

        // Konstruktor
        public AuthController(IUserService userService, IAvatarService avatarService)
        {
            _userService = userService;
            _avatarService = avatarService;
        }

        // Metoda do obsługi rejestracji użytkownika z mapowaniem i metodą HTTP
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest req)
        {
            if (await _userService.GetUserByEmail(req.Email) != null)
                return BadRequest(new { Message = "Podany e-mail jest już zajęty!" });

            if (await _userService.GetUserByUsername(req.Username) != null)
                return BadRequest(new { Message = "Podana nazwa użytkownika jest już zajęta!" });

            var newUser = new User
            {
                Username = req.Username,
                Name = req.Name,
                Surname = req.Surname,
                Email = req.Email,
                Password = req.Password
            };

            await _userService.AddUser(newUser);
            return Ok(new { Message = "Rejestracja zakończona sukcesem!" });
        }

        // Metoda do obsługi logowania użytkownika z mapowaniem i metodą HTTP
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest req)
        {
            var user = await _userService.GetUserByEmail(req.Email);
            if (user == null || !_userService.VerifyPassword(user.Password, req.Password))
                return Unauthorized(new { Message = "Nieprawidłowe dane do logowania!" });

            var claims = new List<Claim> { new(ClaimTypes.Name, user.Email) };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTime.UtcNow.AddDays(30)
            });

            return Ok(new { Message = "Logowanie zakończone sukcesem!" });
        }

        // Metoda do obsługi wylogowania użytkownika z mapowaniem i metodą HTTP
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            return Ok(new { Message = "Wylogowanie zakończone sukcesem!" });
        }

        // Metoda do uwierzytelniania użytkownika na bazie otrzymanego cookie z mapowaniem i metodą HTTP
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { Message = "Nie można potwierdzić tożsamości użytkownika!" });

            var user = await _userService.GetUserByEmail(User.Identity.Name);
            if (user == null)
                return Unauthorized(new { Message = "Użytkownik nieznaleziony!" });

            return Ok(new
            {
                user.UserId,
                user.Username,
                user.Name,
                user.Surname,
                user.Email,
                user.Phone,
                user.AvatarId
            });
        }
    }
}