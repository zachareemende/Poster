using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
// for include
using Microsoft.EntityFrameworkCore;
using Server.Services;

namespace Server.Controllers
{
    [Route("api/poster")]
    [ApiController]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        private MyContext _context;

        private readonly JwtService _jwtService;

        public HomeController(ILogger<HomeController> logger, MyContext context, JwtService jwtService)
        {
            _logger = logger;
            _context = context;
            _jwtService = jwtService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Post>>> GetPosts()
        {
            return await _context.Posts.ToListAsync();
        }

        [HttpGet("posts/{id}")]
        public async Task<ActionResult<Post>> GetPost(int id)
        {
            var userPost = await _context.Posts.FindAsync(id);

            if (userPost == null)
            {
                return NotFound();
            }

            return userPost;
        }

        [HttpPost("posts/create")]
        [Authorize] // Add this attribute for JWT authentication
        public async Task<ActionResult<Post>> PostPost([FromBody] Post newPost)
        {
            if (ModelState.IsValid)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(); // Unauthorized if user claim is missing
                }

                newPost.UserId = int.Parse(userIdClaim.Value);
                _context.Posts.Add(newPost);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetPost),
                    new { id = newPost.PostId },
                    newPost
                );
            }
            else
            {
                return BadRequest(ModelState);
            }
        }

        [HttpDelete("posts/delete/{id}")]
        [Authorize] // Add this attribute for JWT authentication
        public async Task<IActionResult> DeletePost(int id)
        {
            var userPost = await _context.Posts.FindAsync(id);

            if (userPost == null)
            {
                return NotFound();
            }

            // Check if the user has permission to delete this post (if needed)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(); // Unauthorized if user claim is missing
            }

            // Check if the user is the owner of the post (if needed)

            _context.Posts.Remove(userPost);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("users/{userId}/posts")]
        public async Task<ActionResult<IEnumerable<Post>>> GetUserPosts(int userId)
        {
            var userPosts = await _context.Posts.Where(p => p.UserId == userId).ToListAsync();

            if (userPosts == null)
            {
                return NotFound();
            }

            return userPosts;
        }

        [HttpGet("users/{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var oneUser = await _context.Users.FindAsync(id);

            if (oneUser == null)
            {
                return NotFound();
            }

            return oneUser;
        }

        [HttpPost("users/create")]
        public async Task<ActionResult<User>> CreateUser([FromBody] User newUser)
        {
            if (ModelState.IsValid)
            {
                PasswordHasher<User> Hasher = new PasswordHasher<User>();
                newUser.Password = Hasher.HashPassword(newUser, newUser.Password);

                _context.Add(newUser);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetUser),
                    new { id = newUser.UserId },
                    newUser
                );
            }
            else
            {
                return BadRequest(ModelState);
            }
        }


        [HttpPost("users/login")]
        public async Task<ActionResult<AuthenticationResponse>> LoginUser([FromBody] LoginUser logUser)
        {
            var oneUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == logUser.LEmail);

            if (oneUser == null)
            {
                return NotFound();
            }

            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(oneUser, oneUser.Password, logUser.LPassword);

            if (result == PasswordVerificationResult.Success)
            {
                var jwtToken = _jwtService.GenerateJwtToken(oneUser.UserId);

                // Return an AuthenticationResponse containing the token and user details
                var authResponse = new AuthenticationResponse
                {
                    UserId = oneUser.UserId,
                    Username = oneUser.Username,
                    Email = oneUser.Email,
                    Token = jwtToken
                };

                return Ok(authResponse);
            }

            return BadRequest("Invalid credentials");
        }


        [HttpPost("users/logout")]
        public async Task<ActionResult<User>> LogoutUser([FromBody] User user)
        {
            var oneUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);

            if (oneUser == null)
            {
                return NotFound();
            }

            return oneUser;
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        // public class SessionCheckAttribute : ActionFilterAttribute
        // {
        //     public override void OnActionExecuting(ActionExecutingContext context)
        //     {
        //         int? userId = context.HttpContext.Session.GetInt32("UserId");
        //         if (userId == null)
        //         {
        //             context.Result = new RedirectToActionResult("Index", "Home", null);
        //         }
        //     }
        // }
    }
}

