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
            var postsWithLikesAndUsernames = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes) // Include the Likes related to each post
                .Include(p => p.Comments) // Include the Comments related to each post
                .ThenInclude(c => c.User) // Include the User related to each comment
                .OrderByDescending(p => p.PostedAt) // Order posts by postedAt in descending order
                .ToListAsync();

            var postsDto = postsWithLikesAndUsernames.Select(post => new
            {
                PostId = post.PostId,
                ImageUrl = post.ImageUrl,
                Caption = post.Caption,
                PostedAt = post.PostedAt,
                UserId = post.UserId,
                Username = post.User?.Username, // Get the username of the user who posted the photo
                LikeCount = post.Likes.Count, // Get the count of likes for the post
                Comments = post.Comments.Select(comment => new
                {
                    CommentId = comment.CommentId,
                    Content = comment.Text,
                    UserId = comment.UserId,
                    Username = comment.User?.Username,
                    Timestamp = comment.Timestamp
                })
            });

            return Ok(postsDto);
        }



        [HttpGet("posts/{id}")]
        public async Task<ActionResult<Post>> GetPost(int id)
        {
            var userPost = await _context.Posts
                .Include(p => p.Likes) // Include the Likes navigation property
                .Include(p => p.User) // Include the User navigation property
                .Include(p => p.Comments) // Include the Comments navigation property
                .FirstOrDefaultAsync(p => p.PostId == id);

            if (userPost == null)
            {
                return NotFound();
            }

            var postDto = new
            {
                PostId = userPost.PostId,
                ImageUrl = userPost.ImageUrl,
                Caption = userPost.Caption,
                PostedAt = userPost.PostedAt,
                UserId = userPost.UserId,
                Username = userPost.User?.Username,
                LikeCount = userPost.Likes.Count, // Get the count of likes for the post
                Comments = userPost.Comments.Select(comment => new
                {
                    CommentId = comment.CommentId,
                    Content = comment.Text,
                    UserId = comment.UserId,
                    Username = comment.User?.Username,
                    Timestamp = comment.Timestamp
                })
            };

            return Ok(postDto);
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
            var userPosts = await _context.Posts
                .Where(p => p.UserId == userId)
                .Include(p => p.Likes) // Include the Likes navigation property
                .Include(p => p.User) // Include the User navigation property
                .Include(p => p.Comments) // Include the Comments navigation property
                .ThenInclude(c => c.User) // Include the User related to each comment
                .OrderByDescending(p => p.PostedAt) // Order posts by postedAt in descending order
                .ToListAsync();

            var postsDto = userPosts.Select(post => new
            {
                PostId = post.PostId,
                ImageUrl = post.ImageUrl,
                Caption = post.Caption,
                PostedAt = post.PostedAt,
                UserId = post.UserId,
                Username = post.User?.Username, // Get the username of the user who posted the photo
                LikeCount = post.Likes.Count, // Get the count of likes for the post
                Comments = post.Comments
            .OrderByDescending(comment => comment.Timestamp) // Order comments by timestamp in descending order
            .Select(comment => new
            {
                CommentId = comment.CommentId,
                Text = comment.Text,
                UserId = comment.UserId,
                Username = comment.User?.Username,
                Timestamp = comment.Timestamp
            })
            });

            if (userPosts == null)
            {
                return NotFound();
            }

            return Ok(postsDto);
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

        [HttpDelete("users/delete/{id}")]
        [Authorize] // Add this attribute for JWT authentication
        public async Task<IActionResult> DeleteUser(int id)
        {
            var oneUser = await _context.Users.FindAsync(id);

            if (oneUser == null)
            {
                return NotFound();
            }

            // Check if the user has permission to delete this user (if needed)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(); // Unauthorized if user claim is missing
            }

            // Check if the user is the owner of the user (if needed)

            _context.Users.Remove(oneUser);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("posts/{id}/comments")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments(int id)
        {
            var comments = await _context.Comments
                .Where(c => c.PostId == id)
                .OrderByDescending(c => c.Timestamp)
                .Select(c => new
                {
                    c.CommentId,
                    c.Text,
                    c.Timestamp,
                    UserId = c.User.UserId,
                    Username = c.User.Username
                })
                .ToListAsync();

            if (comments == null)
            {
                return NotFound();
            }

            return Ok(comments);
        }


        [HttpPost("posts/{id}/comments/create")]
        [Authorize] // Add this attribute for JWT authentication
        public async Task<ActionResult<Comment>> PostComment(int id, [FromBody] Comment newComment)
        {
            if (ModelState.IsValid)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(); // Unauthorized if user claim is missing
                }

                newComment.UserId = int.Parse(userIdClaim.Value);
                newComment.PostId = id;
                _context.Comments.Add(newComment);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetComments),
                    new { id = newComment.CommentId },
                    newComment
                );
            }
            else
            {
                return BadRequest(ModelState);
            }
        }

        // delete comment
        [HttpDelete("posts/{postId}/comments/delete/{commentId}")]
        [Authorize] // Add this attribute for JWT authentication
        public async Task<IActionResult> DeleteComment(int postId, int commentId)
        {
            var userComment = await _context.Comments.FirstOrDefaultAsync(
                comment => comment.CommentId == commentId && comment.PostId == postId
            );

            if (userComment == null)
            {
                return NotFound();
            }

            // Check if the user has permission to delete this comment (if needed)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(); // Unauthorized if user claim is missing
            }

            // Check if the user is the owner of the comment (if needed)

            _context.Comments.Remove(userComment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("posts/{id}/likes")]
        public async Task<ActionResult<IEnumerable<Like>>> GetLikes(int id)
        {
            var postLikes = await _context.Likes.Where(l => l.PostId == id).ToListAsync();

            if (postLikes == null)
            {
                return NotFound();
            }

            return postLikes;
        }

        [HttpPost("posts/{id}/likes/create")]
        [Authorize]
        public async Task<ActionResult<Like>> PostLike(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim.Value);

            var userLiked = _context.Likes
                .Any(like => like.UserId == userId && like.PostId == id);

            if (userLiked)
            {
                return NoContent(); // User has already liked, no action needed
            }

            var newLike = new Like
            {
                UserId = userId,
                PostId = id
            };

            _context.Likes.Add(newLike);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetLikes),
                new { id = newLike.LikeId },
                newLike
            );
        }


        [HttpDelete("posts/{postId}/likes/delete")]
        [Authorize] // Add this attribute for JWT authentication
        public async Task<IActionResult> DeleteLike(int postId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(); // Unauthorized if user claim is missing
            }

            var userId = int.Parse(userIdClaim.Value);

            var userLike = await _context.Likes.FirstOrDefaultAsync(
                like => like.UserId == userId && like.PostId == postId
            );

            if (userLike == null)
            {
                return NotFound();
            }

            _context.Likes.Remove(userLike);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("posts/{id}/likes/check")]
        [Authorize] // Add this attribute for JWT authentication
        public async Task<ActionResult<bool>> CheckLikeStatus(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(); // Unauthorized if user claim is missing
            }

            var userId = int.Parse(userIdClaim.Value);

            var userLiked = await _context.Likes
                .AnyAsync(like => like.UserId == userId && like.PostId == id);

            return userLiked;
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
    }
}

