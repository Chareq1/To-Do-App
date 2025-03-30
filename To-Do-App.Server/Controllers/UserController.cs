using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services;
using To_Do_App.Server.Services.Interfaces;

namespace To_Do_App.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet(Name = "GetAllUsers")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            try
            {
                var users = await _userService.GetUsers();
                if (users == null || !users.Any())
                {
                    return NotFound("Brak użytkowników w bazie danych!");
                }
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpGet("{userId}", Name = "GetUserById")]
        public async Task<ActionResult<User>> GetUser(Guid userId)
        {
            try
            {
                var user = await _userService.GetUser(userId);
                if (user == null)
                {
                    return NotFound("Nie znaleziono użytkownika o podanym identyfikatorze!");
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpPost(Name = "AddUser")]
        public async Task<ActionResult<User>> AddUser([FromBody] User user)
        {
            if(user == null)
            {
                return BadRequest("Nieprawidłowe dane użytkownika!");
            }

            try
            {
                var createdUser = await _userService.AddUser(user);
                return CreatedAtRoute("GetUserById", new { userId = createdUser.UserId }, createdUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpPatch("{userId}", Name = "UpdateUser")]
        public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] JsonPatchDocument<User> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest("Nieprawidłowe dane wejściowe!");
            }

            if (await _userService.GetUser(userId) == null)
            {
                return NotFound("Nie znaleziono użytkownika o podanym identyfikatorze!");
            }

            try
            {
                await _userService.UpdateUser(userId, patchDoc);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpDelete("{userId}", Name = "DeleteUser")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            if (await _userService.GetUser(userId) == null)
            {
                return NotFound("Nie znaleziono zadania o podanym identyfikatorze!");
            }

            try
            {
                await _userService.DeleteUser(userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpGet("username/{username}", Name = "GetUserByUsername")]
        public async Task<ActionResult<User>> GetUserByUsername(String username)
        {
            try
            {
                var user = await _userService.GetUserByUsername(username);
                if (user == null)
                {
                    return NotFound("Nie znaleziono użytkownika o podanej nazwie!");
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpGet("email/{email}", Name = "GetUserByEmail")]
        public async Task<ActionResult<User>> GetUserByEmail(String email)
        {
            try
            {
                var user = await _userService.GetUserByEmail(email);
                if (user == null)
                {
                    return NotFound("Nie znaleziono użytkownika o podanym adresie e-mail!");
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpGet("user-pass/{username}/{password}", Name = "GetUserByUsernameAndPassword")]
        public async Task<ActionResult<User>> GetUserByUsernameAndPassword(String username, String password)
        {
            try
            {
                var user = await _userService.GetUserByUsernameAndPassword(username, password);
                if (user == null)
                {
                    return NotFound("Nie znaleziono użytkownika o podanej nazwie i haśle!");
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpGet("email-pass/{email}/{password}", Name = "GetUserByEmailAndPassword")]
        public async Task<ActionResult<User>> GetUserByEmailAndPassword(String email, String password)
        {
            try
            {
                var user = await _userService.GetUserByEmailAndPassword(email, password);
                if (user == null)
                {
                    return NotFound("Nie znaleziono użytkownika o podanym adresie e-mail i haśle!");
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }
    }
}
