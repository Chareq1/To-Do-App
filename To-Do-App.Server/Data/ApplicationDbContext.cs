using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresEnum<TaskStatus>();
            modelBuilder.HasPostgresEnum<TaskPriority>();

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(new ValueConverter<DateTime, DateTime>(
                            v => v.ToUniversalTime(), // Convert to UTC on save
                            v => DateTime.SpecifyKind(v, DateTimeKind.Utc))); // Convert to UTC on read
                    }
                }
            }

            base.OnModelCreating(modelBuilder);
        }
    }
}
