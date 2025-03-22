using To_Do_App.Server.Models;

namespace To_Do_App.Server.Services
{
    public interface IAvatarService
    {
        public IEnumerable<Avatar> GetAvatars();
        public Avatar GetAvatar(Guid avatarId);
        public Avatar AddAvatar(Avatar avatar);
        public Avatar UpdateAvatar(Avatar avatar);
        public void DeleteAvatar(Guid avatarId);
        public Avatar? GetDefaultAvatar();
    }
}
