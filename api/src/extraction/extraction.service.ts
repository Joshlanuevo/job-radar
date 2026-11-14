import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { BadGatewayException, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractedJob, ExtractedJobSchema } from './extraction.schema.js';

const SYSTEM_PROMPT = `You extract facts from job posts (LinkedIn, JobStreet, Facebook groups).
Posts may be messy or in Taglish.

Rules:
- Only use facts stated in the post. If something isn't stated, return null (or [] for lists). Never guess.
- Salary: plain numbers ("80k" = 80000). Keep the post's period (usually monthly). Currency as ISO code (PHP, USD) if stated or obvious from "₱"/"php".
- workSetup: "WFH"/"remote" = remote; mixed office days = hybrid; office only = onsite.
- shift: "night", "graveyard", "US hours"/"US shift" = night; stated day hours = day; otherwise unknown.
- Skills: short canonical names ("React", "Node.js", "AWS"). requiredSkills = must-haves; niceToHave = "plus"/"preferred".`;

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.getOrThrow<string>('ANTHROPIC_API_KEY') });
    this.model = config.getOrThrow<string>('CLAUDE_MODEL');
  }

  async extractFromText(text: string): Promise<ExtractedJob> {
    let response;
    try {
      response = await this.client.messages.parse({
        model: this.model,
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        output_config: {
          effort: 'low',
          format: zodOutputFormat(ExtractedJobSchema),
        },
        messages: [{ role: 'user', content: `<job_post>\n${text}\n</job_post>` }],
      });
    } catch (err) {
      if (err instanceof Anthropic.APIError) {
        this.logger.error(`Claude API error ${err.status}: ${err.message}`);
        throw new BadGatewayException('AI service failed, try again');
      }
      throw err;
    }

    this.logger.log(
      `extracted with ${this.model}: ${response.usage.input_tokens} in / ${response.usage.output_tokens} out`,
    );

    if (response.stop_reason === 'refusal') {
      throw new UnprocessableEntityException('AI declined to process this post');
    }
    if (!response.parsed_output) {
      throw new UnprocessableEntityException('Could not extract job details');
    }
    return response.parsed_output;
  }
}
