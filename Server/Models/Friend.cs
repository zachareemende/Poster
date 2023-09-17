#pragma warning disable CS8618
using System.ComponentModel.DataAnnotations;
namespace Server.Models;
public class Friend
{
    [Key]
    public int FriendId { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public int FriendUserId { get; set; }
    public User? FriendUser { get; set; }

    public DateTime FriendshipStarted { get; set; } = DateTime.Now;

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}