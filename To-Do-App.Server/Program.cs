using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using To_Do_App.Server.Data;
using To_Do_App.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DatabaseSettings") ??
        throw new InvalidOperationException("Konfiguracja bazy danych nie znaleziona"))
);
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IAvatarService, AvatarService>();
builder.Services.AddScoped<IUserService, UserService>();

// Add Kestrel server options to handle connection state issues
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
    serverOptions.Limits.MaxConcurrentConnections = 100;
    serverOptions.Limits.MaxConcurrentUpgradedConnections = 100;
});

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("CORS", policy =>
    {
        policy.WithOrigins("https://localhost:51351")
        .AllowAnyHeader()
        .AllowCredentials()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.UseCors("CORS");

app.MapFallbackToFile("/index.html");

app.Run();
