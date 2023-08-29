#pragma warning disable CS8618
using System.ComponentModel.DataAnnotations;
namespace Server.Models;
public class Comment
{
    [Key]
    public int CommentId { get; set; }

    [Required]
    public string Text { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.Now;

    public int UserId { get; set; }
    public User? User { get; set; }

    public int PostId { get; set; }
    public Post? Post { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}