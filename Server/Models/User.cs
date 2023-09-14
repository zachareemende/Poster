#pragma warning disable CS8618
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Server.Models;
public class User
{
    [Key]
    public int UserId { get; set; }

    [Required]
    [UniqueUsername]
    public string Username { get; set; }

    [Required]
    [EmailAddress]
    [UniqueEmail]
    public string Email { get; set; }

    public string? Bio { get; set; }

    // profilepicture
    public string? ProfilePicture { get; set; } = null;

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    [DataType(DataType.Password)]
    public string Password { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    [NotMapped]
    [DataType(DataType.Password)]
    [Compare("Password", ErrorMessage = "The password does not match.")]
    [Display(Name = "Confirm Password")]
    public string Confirm { get; set; }

    public List<Post> Posts { get; set; } = new List<Post>();
    public List<Like> Likes { get; set; } = new List<Like>();
    public List<Comment> Comments { get; set; } = new List<Comment>();

    // friends list
    public List<User> Friends { get; set; } = new List<User>();
}

public class UniqueEmailAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {   
        // This double checks the requirement validation
        if(value == null)
        {
            return new ValidationResult("Email is required"); 
        }

        // This is our connection to the datebase.
        MyContext _context = (MyContext)validationContext.GetService(typeof(MyContext));

        if(_context.Users.Any(e => e.Email == value.ToString()))
        {   
            // If it matches, throw an error
            return new ValidationResult("Email is already in use.");
        } else {
            return ValidationResult.Success;
        }
    }
}

public class UniqueUsernameAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {   
        // This double checks the requirement validation
        if(value == null)
        {
            return new ValidationResult("Username is required"); 
        }

        // This is our connection to the datebase.
        MyContext _context = (MyContext)validationContext.GetService(typeof(MyContext));

        if(_context.Users.Any(e => e.Username == value.ToString()))
        {   
            // If it matches, throw an error
            return new ValidationResult("Username is already in use.");
        } else {
            return ValidationResult.Success;
        }
    }
}