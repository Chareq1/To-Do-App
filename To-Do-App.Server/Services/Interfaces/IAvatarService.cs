using Microsoft.AspNetCore.JsonPatch;
using To_Do_App.Server.Models;

namespace To_Do_App.Server.Services.Interfaces
{
    public interface IAvatarService
    {
        public Task<IEnumerable<Avatar>> GetAvatars();
        public Task<Avatar> GetAvatar(Guid avatarId);
        public Task<Avatar> AddAvatar(Avatar avatar);
        public System.Threading.Tasks.Task UpdateAvatar(Guid avatarId, JsonPatchDocument<Avatar> patchDoc);
        public System.Threading.Tasks.Task DeleteAvatar(Guid avatarId);
        public Task<Avatar?> GetDefaultAvatar();
    }
}
