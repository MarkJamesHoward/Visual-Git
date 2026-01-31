using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using GitVisualiserAPI.Kafka;
using GitVisualiserAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace GitVisualiserAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GitInternalsController : ControllerBase
    {
        private readonly GitInternalContext _context;

        public GitInternalsController(GitInternalContext context)
        {
            _context = context;
        }

        // GET: api/GitInternals
        [HttpGet("{userId}")]
        [EnableRateLimiting("GlobalPolicy")]
        public async Task<ActionResult<IEnumerable<GitInternal>>> GetGitInternals()
        {
            if (_context.GitInternals == null)
            {
                return NotFound();
            }
            return await _context.GitInternals.ToListAsync();
        }

        // GET: api/GitInternals/5
        [HttpGet("{userId}/{id}")]
        [EnableRateLimiting("GlobalPolicy")]
        public async Task<ActionResult<GitInternal>> GetGitInternal(string userId, string id)
        {
            if (_context.GitInternals == null)
            {
                return NotFound();
            }
            var gitInternal = await _context.GitInternals.FindAsync(userId, id);

            if (gitInternal == null)
            {
                return NotFound();
            }

            return gitInternal;
        }

        // PUT: api/GitInternals/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{userId}/{id}")]
        public async Task<IActionResult> PutGitInternal(
            string userId,
            string id,
            GitInternal gitInternal
        )
        {
            HttpClient client = new();

            if (id != gitInternal.Id)
            {
                return BadRequest();
            }

            _context.Entry(gitInternal).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                var values = new Dictionary<string, string>
                {
                    { "thing1", "hello" },
                    { "thing2", "world" },
                };
                var content = new FormUrlEncodedContent(values);
                var response = await client.PostAsync(
                    "https://prod-27.australiasoutheast.logic.azure.com:443/workflows/64a996a4008b4259be62dd0d05def19b/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5NaxJ6hu4Xv8zrc_gkg0jUkWa_8Btap8yLCb6MgORTo",
                    content
                );
                var result = await response.Content.ReadAsStringAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GitInternalExists(userId, id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/GitInternals
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [EnableRateLimiting("GlobalPolicy")]
        public async Task<ActionResult<GitInternal>> PostGitInternal(GitInternal gitInternal)
        {
            HttpClient client = new();

            if (_context.GitInternals == null)
            {
                return Problem("Entity set 'GitInternalContext.GitInternals'  is null.");
            }
            _context.GitInternals.Add(gitInternal);
            await _context.SaveChangesAsync();

            var values = new Dictionary<string, string>
            {
                { "thing1", "hello" },
                { "thing2", "world" },
            };
            var content = new FormUrlEncodedContent(values);
            var response = await client.PostAsync(
                "https://prod-27.australiasoutheast.logic.azure.com:443/workflows/64a996a4008b4259be62dd0d05def19b/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5NaxJ6hu4Xv8zrc_gkg0jUkWa_8Btap8yLCb6MgORTo",
                content
            );
            var result = await response.Content.ReadAsStringAsync();

            //Store in Kafka Topic
            try
            {
                string serializedGitInternal = JsonSerializer.Serialize(gitInternal);
                await KafkaProducer.SendMessage(serializedGitInternal);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Kafka message sending failed: {ex.Message}");
            }

            return CreatedAtAction(
                "GetGitInternal",
                new { userId = gitInternal.UserId, id = gitInternal.Id },
                gitInternal
            );
        }

        // DELETE: api/GitInternals/5
        [HttpDelete("{userId}/{id}")]
        public async Task<IActionResult> DeleteGitInternal(string userId, string id)
        {
            if (_context.GitInternals == null)
            {
                return NotFound();
            }
            var gitInternal = await _context.GitInternals.FindAsync(userId, id);
            if (gitInternal == null)
            {
                return NotFound();
            }

            _context.GitInternals.Remove(gitInternal);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GitInternalExists(string userId, string id)
        {
            return (
                _context.GitInternals?.Any(e => e.Id == id && e.UserId == userId)
            ).GetValueOrDefault();
        }
    }
}
