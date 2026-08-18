using Microsoft.EntityFrameworkCore;
using Npgsql;
using ProductApi.Data;
using ProductApi.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

var databaseConnection = builder.Configuration["Database:Connection"]
    ?? throw new InvalidOperationException("Database connection settings were not found.");
var databasePassword = builder.Configuration["Database:Password"]
    ?? throw new InvalidOperationException("Database password was not found.");

var connectionStringBuilder = new NpgsqlConnectionStringBuilder(databaseConnection)
{
    Password = databasePassword
};

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionStringBuilder.ConnectionString));
builder.Services.AddScoped<IProductService, ProductService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Angular", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "http://127.0.0.1:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors("Angular");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
        options.WithTitle("Product API"));
}

app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Redirect("/scalar/v1"))
    .ExcludeFromDescription();

app.Run();
