package com.genbridge.backend.config;

import com.genbridge.backend.entity.Content;
import com.genbridge.backend.entity.Lesson;
import com.genbridge.backend.repository.ContentRepository;
import com.genbridge.backend.repository.LessonRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ContentSeeder implements CommandLineRunner {

    private final LessonRepository lessonRepository;
    private final ContentRepository contentRepository;

    public ContentSeeder(LessonRepository lessonRepository, ContentRepository contentRepository) {
        this.lessonRepository = lessonRepository;
        this.contentRepository = contentRepository;
    }

    @Override
    public void run(String... args) {
        if (lessonRepository.count() > 0) {
            return; // Already seeded
        }

        // Lesson 1: Introduction to Generative AI
        Lesson lesson1 = new Lesson();
        lesson1.setTitle("Introduction to Generative AI");
        lesson1.setDescription("Learn the foundational concepts behind generative AI and how it creates new content.");
        lesson1.setDifficulty("BEGINNER");
        lesson1.setObjective("Understand what generative AI is, how it differs from traditional AI, and key terminology.");
        lesson1.setPublished(true);
        lesson1 = lessonRepository.save(lesson1);

        addContent(lesson1.getId(), "Generative AI", "Generative AI",
                "A type of artificial intelligence that can create new content such as text, images, audio, and video.",
                "ChatGPT generates text responses; DALL-E generates images from prompts.", 1);
        addContent(lesson1.getId(), "Large Language Model (LLM)", "LLM",
                "A deep learning model trained on massive text datasets that can understand and generate human-like language.",
                "GPT-4, Claude, and Gemini are examples of large language models.", 2);
        addContent(lesson1.getId(), "Prompt", "Prompt",
                "The input text or instruction given to a generative AI model to guide its output.",
                "\"Write a haiku about the ocean\" is a prompt to a text generation model.", 3);
        addContent(lesson1.getId(), "Token", "Token",
                "The basic unit of text that a language model processes, typically a word or part of a word.",
                "The sentence \"Hello world\" contains approximately 2 tokens.", 4);

        // Lesson 2: Prompt Engineering Basics
        Lesson lesson2 = new Lesson();
        lesson2.setTitle("Prompt Engineering Basics");
        lesson2.setDescription("Learn how to craft effective prompts to get better results from AI models.");
        lesson2.setDifficulty("INTERMEDIATE");
        lesson2.setObjective("Master the techniques of writing clear, specific, and structured prompts for generative AI systems.");
        lesson2.setPublished(true);
        lesson2 = lessonRepository.save(lesson2);

        addContent(lesson2.getId(), "Zero-Shot Prompting", "Zero-Shot",
                "Asking the model to perform a task without providing any examples, relying on the model's pretrained knowledge.",
                "\"Translate this sentence to French: 'Good morning'\" is a zero-shot prompt.", 1);
        addContent(lesson2.getId(), "Few-Shot Prompting", "Few-Shot",
                "Providing a few examples in the prompt to help the model understand the desired format or behaviour.",
                "Showing 3 example Q&A pairs before asking your actual question.", 2);
        addContent(lesson2.getId(), "Chain-of-Thought", "CoT",
                "A prompting technique that instructs the model to reason step by step before giving a final answer.",
                "Adding \"Think step by step\" to a math problem prompt improves accuracy.", 3);
        addContent(lesson2.getId(), "System Prompt", "System Prompt",
                "An instruction given to the AI before the user conversation begins, used to set its persona or behaviour.",
                "\"You are a helpful customer service agent for a bank.\" as a system prompt.", 4);

        // Lesson 3: AI Ethics and Responsible Use
        Lesson lesson3 = new Lesson();
        lesson3.setTitle("AI Ethics and Responsible Use");
        lesson3.setDescription("Explore the ethical considerations and responsible practices when working with AI systems.");
        lesson3.setDifficulty("BEGINNER");
        lesson3.setObjective("Understand bias, hallucination, privacy concerns, and responsible AI principles.");
        lesson3.setPublished(true);
        lesson3 = lessonRepository.save(lesson3);

        addContent(lesson3.getId(), "AI Hallucination", "Hallucination",
                "When an AI model generates information that sounds plausible but is factually incorrect or made up.",
                "An AI confidently stating a false historical date or fabricating a book citation.", 1);
        addContent(lesson3.getId(), "Bias in AI", "Bias",
                "Systematic errors in AI outputs caused by biased training data or flawed model design.",
                "A hiring AI ranking candidates lower based on gender due to historical data bias.", 2);
        addContent(lesson3.getId(), "Data Privacy", "Data Privacy",
                "The right of individuals to control how their personal information is collected and used by AI systems.",
                "Avoiding input of personal health data into public AI tools that retain conversations.", 3);
        addContent(lesson3.getId(), "Human-in-the-Loop", "HITL",
                "A design approach where humans review or approve AI outputs before they are acted upon.",
                "A doctor reviewing an AI-generated diagnosis before prescribing treatment.", 4);

        // TODO: Seed QuizQuestion data here once QuizQuestion entity is available (Tian Le's branch)
    }

    private void addContent(Long lessonId, String title, String term,
                            String description, String example, int orderIndex) {
        Content content = new Content();
        content.setLessonId(lessonId);
        content.setTitle(title);
        content.setTerm(term);
        content.setDescription(description);
        content.setExample(example);
        content.setOrderIndex(orderIndex);
        contentRepository.save(content);
    }
}
