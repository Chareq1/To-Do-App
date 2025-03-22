using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace To_Do_App.Server.Models
{
    [Table("Avatars")]
    public class Avatar
    {
        [Key]
        [Column("avatarId")]
        public Guid AvatarId { get; set; }

        [Column("fileName")]
        public String? FileName { get; set; }

        [Column("filePath")]
        public String? FilePath { get; set; }
    }
}
