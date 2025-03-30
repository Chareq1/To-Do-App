using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services;
using To_Do_App.Server.Services.Interfaces;

namespace To_Do_App.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AvatarController : ControllerBase
    {
        private readonly IAvatarService _avatarService;

        public AvatarController(IAvatarService avatarService)
        {
            _avatarService = avatarService;
        }

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

        [HttpPost(Name = "AddAvatar")]
        public async Task<ActionResult<Avatar>> AddAvatar([FromBody] Avatar avatar)
        {
            if (avatar == null)
            {
                return BadRequest("Nieprawidłowe dane wejściowe!");
            }

            try
            {
                var createdAvatar = await _avatarService.AddAvatar(avatar);
                return CreatedAtRoute("GetAvatarById", new { avatarId = createdAvatar.AvatarId }, createdAvatar);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }

        }

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
