using Microsoft.EntityFrameworkCore;
using To_Do_App.Server.Models;

namespace To_Do_App.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Avatar> Avatars { get; set; } = default!;
        public DbSet<User> Users { get; set; } = default!;
        public DbSet<Category> Categories { get; set; } = default!;
        public DbSet<Models.Task> Tasks { get; set; } = default!;
        public DbSet<Resource> Resources { get; set; } = default!;
        public DbSet<Subtask> Subtasks { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Models.Task>()
                .Property(t => t.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Models.Task>()
                .Property(t => t.Priority)
                .HasConversion<string>();

            modelBuilder.Entity<Subtask>()
                .Property(s => s.Status)
                .HasConversion<string>();
        }
    }
}
