using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace To_Do_App.Server.Models
{
    [Table("Resources")]
    public class Resource
    {
        [Key]
        [Column("resourceId")]
        public Guid ResourceId { get; set; }

        [Column("resourceType")]
        public String ResourceType { get; set; }

        [Column("fileName")]
        [MaxLength(255)]
        public String FileName { get; set; }

        [Column("filePath")]
        public String FilePath { get; set; }

        [Column("taskId")]
        public Guid? TaskId { get; set; }

        [Column("subtaskId")]
        public Guid? SubtaskId { get; set; }

        [Column("uploadDate")]
        public DateTime UploadDate { get; set; }
    }
}
