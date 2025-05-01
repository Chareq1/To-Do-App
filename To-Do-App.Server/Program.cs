using Microsoft.EntityFrameworkCore;
using To_Do_App.Server.Data;
using To_Do_App.Server.Services;
using To_Do_App.Server.Services.Interfaces;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text;
using Microsoft.OpenApi.Models; // Add this using directive

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
    {
        var connectionString = builder.Configuration.GetConnectionString("DatabaseSettings")
            ?? throw new InvalidOperationException("Konfiguracja bazy danych nie znaleziona");

        options.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.MapEnum<To_Do_App.Server.Data.TaskStatus>("task_status");
            npgsqlOptions.MapEnum<To_Do_App.Server.Data.TaskPriority>("task_priority");
        });
    });
builder.Services.AddControllers()
    .AddNewtonsoftJson(); // Move AddNewtonsoftJson here
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add services for dependency injection    
builder.Services.AddScoped<IAvatarService, AvatarService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IResourceService, ResourceService>();

// Add authentication and authorization services
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.LoginPath = "/api/auth/login";
        options.LogoutPath = "/api/auth/logout";
        options.SlidingExpiration = true;
    });


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
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Resources")),
    RequestPath = "/Resources"
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseCors("CORS");

app.MapFallbackToFile("/index.html");

app.Run();

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
Console.OutputEncoding = Encoding.UTF8;