using To_Do_App.Server.Models;

namespace To_Do_App.Server.Services
{
    public interface IUserService
    {
        public IEnumerable<User> GetUsers();
        public User GetUser(Guid userId);
        public User AddUser(User user);
        public User UpdateUser(User user);
        public void DeleteUser(Guid userId);
    }
}
