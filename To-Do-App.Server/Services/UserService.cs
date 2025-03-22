using System.Xml.Linq;
using To_Do_App.Server.Data;
using To_Do_App.Server.Models;

namespace To_Do_App.Server.Services
{
    public class UserService : IUserService
    {
        ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public IEnumerable<User> GetUsers()
        {
            var userList = _context.Users.ToList();
            foreach(var user in userList)
            {
                user.UserAvatar = _context.Avatars.FirstOrDefault(a => a.AvatarId == user.AvatarId);
            }
            return userList;
        }

        public User? GetUser(Guid userId)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
            user.UserAvatar = _context.Avatars.FirstOrDefault(a => a.AvatarId == user.AvatarId);
            return user;
        }

        public User AddUser(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
            return user;
        }

        public User UpdateUser(User user)
        {
            _context.Users.Update(user);
            _context.SaveChanges();
            return user;
        }

        public void DeleteUser(Guid userId)
        {
            var user = GetUser(userId);

            if (user != null)
            {
                _context.Users.Remove(user);
                _context.SaveChanges();
            }
        }
    }
}
