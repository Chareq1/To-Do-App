using Npgsql.Internal.Postgres;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using To_Do_App.Server.Data;

namespace To_Do_App.Server.Models
{
    [Table("Subtasks")]
    public class Subtask
    {
        [Key]
        [Column("subtaskId")]
        public Guid SubtaskId { get; set; }

        [Column("name")]
        [MaxLength(255)]
        public String Name { get; set; }

        [Column("description")]
        public String? Description { get; set; }

        [Column("status")]
        public Data.TaskStatus Status { get; set; }

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; }

        [Column("taskId")]
        public Guid TaskId { get; set; }

        [Column("dueDate")]
        public DateTime? DueDate { get; set; }
    }
}
