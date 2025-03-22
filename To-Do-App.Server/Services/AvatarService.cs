using To_Do_App.Server.Data;
using To_Do_App.Server.Models;

namespace To_Do_App.Server.Services
{
    public class AvatarService : IAvatarService
    {
        ApplicationDbContext _context;

        public AvatarService(ApplicationDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Avatar> GetAvatars()
        {
            return _context.Avatars.ToList();
        }

        public Avatar? GetAvatar(Guid avatarId)
        {
            return _context.Avatars.FirstOrDefault(a => a.AvatarId == avatarId);
        }

        public Avatar AddAvatar(Avatar avatar)
        {
            _context.Avatars.Add(avatar);
            _context.SaveChanges();
            return avatar;
        }

        public Avatar UpdateAvatar(Avatar avatar)
        {
            _context.Avatars.Update(avatar);
            _context.SaveChanges();
            return avatar;
        }

        public void DeleteAvatar(Guid avatarId)
        {
            var avatar = GetAvatar(avatarId);
            if (avatar != null)
            {
                _context.Avatars.Remove(avatar);
                _context.SaveChanges();
            }
        }

        public Avatar? GetDefaultAvatar()
        {
            return _context.Avatars.FirstOrDefault(a => a.FileName == "default.png");
        }
    }
}
