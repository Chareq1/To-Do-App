using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using To_Do_App.Server.Data;

namespace To_Do_App.Server.Models
{
    [Table("Tasks")]
    public class Task
    {
        [Key]
        [Column("taskId")]
        public Guid TaskId { get; set; }

        [MaxLength(255)]
        [Column("name")]
        public String Name { get; set; }

        [Column("description")]
        public String? Description { get; set; }

        [Column("status")]
        public Data.TaskStatus Status { get; set; }

        [Column("priority")]
        public Data.TaskPriority Priority { get; set; }

        [Column("categoryId")]
        public Guid? CategoryId { get; set; }

        [Required]
        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("dueDate")]
        public DateTime? DueDate { get; set; }

        [Column("userId")]
        public Guid UserId { get; set; }
    }
}
