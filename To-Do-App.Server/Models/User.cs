using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace To_Do_App.Server.Models
{
    [Table("Users")]
    public class User
    {
        [Column("userId")]
        public Guid UserId { get; set; }

        [Column("username")]
        [MaxLength(40)]
        public String? Username { get; set; }

        [MaxLength(128)]
        [Column("password")]
        [MinLength(8)]
        public String? Password { get; set; }

        [Column("name")]
        [MaxLength(255)]
        public String? Name { get; set; }

        [MaxLength(255)]
        [Column("surname")]
        public String? Surname { get; set; }

        [MaxLength(320)]
        [Column("email")]
        public String? Email { get; set; }

        [MaxLength(9)]
        [Column("phone")]
        public String? Phone { get; set; }

        [Column("avatarId")]
        public Guid? AvatarId { get; set; }
    }
}
