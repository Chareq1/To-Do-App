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
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest req)
        {
            if (await _userService.GetUserByEmail(req.Email) != null)
                return BadRequest(new { Message = "Email is already in use" });

            await _userService.AddUser(new User { Email = req.Email, Password = req.Password });
            return Ok(new { Message = "Registration successful" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest req)
        {
            var user = await _userService.GetUserByEmail(req.Email);
            if (user == null || !_userService.VerifyPassword(user.Password, req.Password))
                return Unauthorized(new { Message = "Invalid credentials" });

            var claims = new List<Claim> { new(ClaimTypes.Name, user.Email) };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTime.UtcNow.AddDays(30)
            });
            return Ok(new { Message = "Login successful" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { Message = "Logout successful" });
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { Message = "User is not authenticated" });

            var user = await _userService.GetUserByEmail(User.Identity.Name);
            if (user == null)
                return Unauthorized(new { Message = "User not found" });

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