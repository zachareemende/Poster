#pragma warning disable CS8618
using System.ComponentModel.DataAnnotations;
namespace Server.Models;
public class MyViewModel
{
    public User? LoggedInUser { get; set; }
    public List<User> AllUsers { get; set; }

    public Post Post { get; set; }
    public List<Post> AllPosts { get; set; }

    public Comment Comment { get; set; }
    public List<Comment> AllComments { get; set; }

    public Like Like { get; set; }
    public List<Like> AllLikes { get; set; }
}