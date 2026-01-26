using Dapper;
using Microsoft.AspNetCore.RateLimiting;
using Nexus.BCMS.Shared.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers()
    .AddJsonOptions(options => 
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddHttpContextAccessor();

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 100;
        opt.QueueLimit = 2;
        opt.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
    });
});

// Custom Services
// In production, fetch this from Key Vault or Env
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Database=doric;Username=postgres;Password=Muhamed974";

// Core Factory
var rawFactory = new Nexus.BCMS.Shared.Infrastructure.PostgresConnectionFactory(connectionString);
builder.Services.AddSingleton<Nexus.BCMS.Shared.Infrastructure.IDbConnectionFactory>(rawFactory);

// Hardened Factory (Scoped to Tenant)
builder.Services.AddScoped<Nexus.BCMS.Core.Infrastructure.ITenantService, Nexus.BCMS.Core.Infrastructure.StaticTenantService>();
builder.Services.AddScoped<Nexus.BCMS.Core.Infrastructure.AuditService>();

// Decorator for Secure Connections
builder.Services.AddScoped<Nexus.BCMS.Shared.Infrastructure.IDbConnectionFactory>(sp => 
{
    var tenantService = sp.GetRequiredService<Nexus.BCMS.Core.Infrastructure.ITenantService>();
    return new Nexus.BCMS.Core.Infrastructure.TenantAwareConnectionFactory(rawFactory, tenantService);
});

builder.Services.AddScoped<Nexus.BCMS.Core.Features.RiskManagement.RiskRepository>();
builder.Services.AddScoped<Nexus.BCMS.Core.Features.GraphManagement.GraphRepository>();
builder.Services.AddScoped<Nexus.BCMS.Core.Features.ThreatManagement.ThreatRepository>();
builder.Services.AddScoped<Nexus.BCMS.Core.Features.StrategyManagement.StrategicPlanningRepository>();
builder.Services.AddScoped<Nexus.BCMS.Core.Features.StrategyManagement.StrategyRepository>();
builder.Services.AddScoped<Nexus.BCMS.Core.Features.SimulationManagement.SimulationRepository>();
builder.Services.AddScoped<Nexus.BCMS.Core.Features.ExerciseManagement.ExerciseRepository>();
builder.Services.AddScoped<Nexus.BCMS.Core.Features.ReportingManagement.ReportingRepository>();

// Load YARP Configuration
builder.Configuration.AddJsonFile("appsettings.yarp.json", optional: false, reloadOnChange: true);

// Auth
builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Phase 3.3: Security Headers Baseline
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none';");
    await next();
});

// Health Check with RLS & Audit Validation
app.MapGet("/health/ready", async (Nexus.BCMS.Shared.Infrastructure.IDbConnectionFactory dbFactory, Nexus.BCMS.Core.Infrastructure.ITenantService tenantService) =>
{
    try 
    {
        using var conn = await dbFactory.CreateConnectionAsync();
        // Validate RLS
        await Nexus.BCMS.Core.Infrastructure.DapperExtensions.SetTenantContextAsync(conn, tenantService.GetCurrentTenantId());
        
        // Validate Audit Logs availability
        var auditCount = await conn.ExecuteScalarAsync<int>("SELECT count(*) FROM \"GlobalAuditLog\"");
        
        return Results.Ok(new { 
            status = "Ready", 
            database = "Connected", 
            rls = "Active", 
            audit = "Available",
            audit_count = auditCount
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Compliance check failed: {ex.Message}");
    }
});

app.UseHttpsRedirection();

// .NET Controllers (API v2)
app.MapControllers();

// YARP Reverse Proxy (API v1 - Fallback)
app.MapReverseProxy();

app.Run();
