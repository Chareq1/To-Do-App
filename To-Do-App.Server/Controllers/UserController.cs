using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services;

namespace To_Do_App.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet(Name = "GetAllUsers")]
        public IEnumerable<User> GetUsers()
        {
            return _userService.GetUsers();
        }

        [HttpGet("{userId}", Name = "GetUserById")]
        public User GetUser(Guid userId)
        {
            return _userService.GetUser(userId);
        }

        [HttpPost(Name = "AddUser")]
        public User AddUser([FromBody] User user)
        {
            return _userService.AddUser(user);
        }

        [HttpPut(Name = "UpdateUser")]
        public User UpdateUser([FromBody] User user)
        {
            return _userService.UpdateUser(user);
        }

        [HttpDelete("{userId}", Name = "DeleteUser")]
        public void DeleteUser(Guid userId)
        {
            _userService.DeleteUser(userId);
        }
    }
}
