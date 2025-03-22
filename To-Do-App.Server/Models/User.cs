using System.ComponentModel.DataAnnotations.Schema;

namespace To_Do_App.Server.Models
{
    [Table("Users")]
    public class User
    {
        [Column("userId")]
        public Guid UserId { get; set; }

        [Column("username")]
        public String? Username { get; set; }

        [Column("password")]
        public String? Password { get; set; }

        [Column("name")]
        public String? Name { get; set; }

        [Column("surname")]
        public String? Surname { get; set; }

        [Column("email")]
        public String? Email { get; set; }

        [Column("phone")]
        public String? Phone { get; set; }

        [Column("avatarId")]
        public Guid? AvatarId { get; set; }

        public Avatar? UserAvatar{ get; set; }
    }
}
