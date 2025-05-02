using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using To_Do_App.Server.Data;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services;
using To_Do_App.Server.Services.Interfaces;

namespace To_Do_App.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // Kontroler do obsługi avatarów
    public class AvatarController : ControllerBase
    {
        // Usługi
        private readonly IAvatarService _avatarService;
        private readonly IUserService _userService;

        // Konstruktor
        public AvatarController(IAvatarService avatarService, IUserService userService)
        {
            _avatarService = avatarService;
            _userService = userService;
        }

        // Metoda do uzyskiwania wszystkich avatarów z mapowaniem i metodą HTTP
        [HttpGet(Name = "GetAllAvatars")]
        public async Task<ActionResult<IEnumerable<Avatar>>> GetAvatars()
        {
            try
            {
                var avatars = await _avatarService.GetAvatars();
                if (avatars == null || !avatars.Any())
                {
                    return NotFound("Brak awatarów w bazie danych!");
                }
                return Ok(avatars);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        // Metoda do uzyskiwania avatara po ID z mapowaniem i metodą HTTP
        [HttpGet("{avatarId}", Name = "GetAvatarById")]
        public async Task<ActionResult<Avatar>> GetAvatar(Guid avatarId)
        {
            try
            {
                var avatar = await _avatarService.GetAvatar(avatarId);
                if (avatar == null)
                {
                    return NotFound("Nie znaleziono awatara o podanym identyfikatorze!");
                }
                return Ok(avatar);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        // Metoda do dodawania avatara z mapowaniem i metodą HTTP
        [HttpPost(Name = "AddAvatar")]
        public async Task<ActionResult<Avatar>> AddAvatar([FromForm] FileUploadRequest file, [FromQuery] Guid userId)
        {
            if (file == null || file.File.Length == 0)
            {
                return BadRequest("Brak pliku!");
            }

            try
            {
                var user = await _userService.GetUser(userId);
                var defaultAvatar = await _avatarService.GetDefaultAvatar();
                var currentAvatar = user.AvatarId;

                if(defaultAvatar?.AvatarId != user.AvatarId)
                {
                    await _avatarService.DeleteAvatar(user.AvatarId);
                }

                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "Resources", "Avatars");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.File.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.File.CopyToAsync(stream);
                }

                var avatar = new Avatar
                {
                    AvatarId = Guid.NewGuid(),
                    FileName = fileName,
                    FilePath = "/Resources/Avatars/"
                };

                var createdAvatar = await _avatarService.AddAvatar(avatar);
                return CreatedAtRoute("GetAvatarById", new { avatarId = createdAvatar.AvatarId }, createdAvatar);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }

        }

        // Metoda do aktualizacji avatara z mapowaniem i metodą HTTP
        [HttpPatch("{avatarId}", Name = "UpdateAvatar")]
        public async Task<IActionResult> UpdateAvatar(Guid avatarId, [FromBody] JsonPatchDocument<Avatar> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest("Nieprawidłowe dane wejściowe!");
            }

            if (await _avatarService.GetAvatar(avatarId) == null)
            {
                return NotFound("Nie znaleziono awatara o podanym identyfikatorze!");
            }

            try
            {
                await _avatarService.UpdateAvatar(avatarId, patchDoc);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        // Metoda do usuwania z mapowaniem i metodą HTTP
        [HttpDelete("{avatarId}", Name = "DeleteAvatar")]
        public async Task<IActionResult> DeleteAvatar(Guid avatarId)
        {
            if (await _avatarService.GetAvatar(avatarId) == null)
            {
                return NotFound("Nie znaleziono awatara o podanym identyfikatorze!");
            }

            try
            {
                await _avatarService.DeleteAvatar(avatarId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        // Metoda do uzyskiwania domyślnego avatara z mapowaniem i metodą HTTP
        [HttpGet("default", Name = "GetDefaultAvatar")]
        public async Task<ActionResult<Avatar>> GetDefaultAvatar()
        {
            try
            {
                return await _avatarService.GetDefaultAvatar();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }
    }
}
