using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services;

namespace To_Do_App.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AvatarController : ControllerBase
    {
        IAvatarService _avatarService;

        public AvatarController(IAvatarService avatarService)
        {
            _avatarService = avatarService;
        }

        [HttpGet(Name = "GetAllAvatars")]
        public IEnumerable<Avatar> GetAvatars()
        {
            return _avatarService.GetAvatars();
        }

        [HttpGet("{avatarId}", Name = "GetAvatarById")]
        public Avatar GetAvatar(Guid avatarId)
        {
            return _avatarService.GetAvatar(avatarId);
        }

        [HttpPost(Name = "AddAvatar")]
        public Avatar AddAvatar([FromBody] Avatar avatar)
        {
            return _avatarService.AddAvatar(avatar);
        }
 
        [HttpPut(Name = "UpdateAvatar")]
        public Avatar UpdateAvatar([FromBody] Avatar avatar)
        {
            return _avatarService.UpdateAvatar(avatar);
        }

        [HttpDelete("{avatarId}", Name = "DeleteAvatar")]
        public void DeleteAvatar(Guid avatarId)
        {
            _avatarService.DeleteAvatar(avatarId);
        }

        [HttpGet("default", Name = "GetDefaultAvatar")]
        public Avatar GetDefaultAvatar()
        {
            return _avatarService.GetDefaultAvatar();
        }
    }
}
