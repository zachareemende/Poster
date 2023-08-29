#pragma warning disable CS8618
using System.ComponentModel.DataAnnotations;
namespace Server.Models;
public class Like
{
    [Key]
    public int LikeId { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public int PostId { get; set; }
    public Post? Post { get; set; }
}