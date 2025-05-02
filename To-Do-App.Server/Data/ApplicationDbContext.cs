using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using To_Do_App.Server.Models;

namespace To_Do_App.Server.Data
{
    // Klasa do obsługi kontekstu bazy danych
    public class ApplicationDbContext : DbContext
    {
        // Konstruktor
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Właściwości dla różnych modeli (tabel w bazie danych)
        public DbSet<Avatar> Avatars { get; set; } = default!;
        public DbSet<User> Users { get; set; } = default!;
        public DbSet<Category> Categories { get; set; } = default!;
        public DbSet<Models.Task> Tasks { get; set; } = default!;
        public DbSet<Resource> Resources { get; set; } = default!;

        // Metoda do konfigurowania modelu bazy danych
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Konfiguracja obsługi obiektów enum
            modelBuilder.HasPostgresEnum<TaskStatus>();
            modelBuilder.HasPostgresEnum<TaskPriority>();

            // Konfiguracja właściwości czasu w UTC
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(new ValueConverter<DateTime, DateTime>(
                            v => v.ToUniversalTime(),
                            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)));
                    }
                }
            }

            base.OnModelCreating(modelBuilder);
        }
    }
}
