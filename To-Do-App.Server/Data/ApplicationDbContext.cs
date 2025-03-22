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
    }
}
