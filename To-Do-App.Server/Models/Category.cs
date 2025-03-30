using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace To_Do_App.Server.Models
{
    [Table("Categories")]
    public class Category
    {
        [Key]
        [Column("categoryId")]
        public Guid CategoryId { get; set; }

        [Column("colorHex")]
        [MaxLength(7)]
        public String ColorHex { get; set; }

        [Column("iconName")]
        public String? IconName { get; set; }

        [Column("userId")]
        public Guid UserId { get; set; }
    }
}
