#pragma warning disable CS8618
using Microsoft.EntityFrameworkCore;
namespace Server.Models;
public class MyContext : DbContext 
{   
    public MyContext(DbContextOptions options) : base(options) { }
    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Like> Likes { get; set; } 
    public DbSet<Friend> Friends { get; set; }
    public DbSet<Comment> Comments { get; set; }
}