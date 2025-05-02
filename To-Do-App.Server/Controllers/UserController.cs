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
    // Kontroler do obsługi użytkowników
    public class UserController : ControllerBase
    {
        // Usługi
        private readonly IUserService _userService;

        // Konstruktor
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // Metoda do uzyskiwania wszystkich użytkowników z mapowaniem i metodą HTTP
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

        // Metoda do uzyskiwania użytkownika po ID z mapowaniem i metodą HTTP
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

        // Metoda do dodawania użytkownika z mapowaniem i metodą HTTP
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

        // Metoda do aktualizacji użytkownika z mapowaniem i metodą HTTP
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

        // Metoda do usuwania użytkownika z mapowaniem i metodą HTTP
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
    }
}
