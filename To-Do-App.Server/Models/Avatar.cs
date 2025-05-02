using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace To_Do_App.Server.Models
{
    // Model tabeli dla avatarów
    [Table("Avatars")]
    public class Avatar
    {
        [Key]
        [Column("avatarId")]
        public Guid AvatarId { get; set; }

        [Column("fileName")]
        [MaxLength(255)]
        public String? FileName { get; set; }

        [Column("filePath")]
        [MaxLength(255)]
        public String? FilePath { get; set; }
    }
}
