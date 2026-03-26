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

        // Lesson 1: Rizz, Sigma & Skibidi
        Lesson lesson1 = new Lesson();
        lesson1.setTitle("Rizz, Sigma & Skibidi");
        lesson1.setDescription("Decode the most iconic Gen-Alpha slang terms that took over the internet.");
        lesson1.setDifficulty("BEGINNER");
        lesson1.setObjective("Understand the meaning and usage of core Gen-Alpha slang words like rizz, sigma, and skibidi.");
        lesson1.setPublished(true);
        lesson1 = lessonRepository.save(lesson1);

        addContent(lesson1.getId(), "Rizz", "Rizz",
                "Natural charm or charisma, especially the ability to attract others effortlessly.",
                "\"He walked in and instantly had rizz — everyone wanted to talk to him.\"", 1);
        addContent(lesson1.getId(), "Sigma", "Sigma",
                "A person who is self-reliant, independent, and successful without needing social validation. Often used ironically.",
                "\"He doesn't care what anyone thinks — total sigma grindset.\"", 2);
        addContent(lesson1.getId(), "Skibidi", "Skibidi",
                "Originally from a viral YouTube series; used to describe something nonsensical, chaotic, or just as filler slang.",
                "\"That test was so skibidi, I had no idea what was going on.\"", 3);
        addContent(lesson1.getId(), "Gyatt", "Gyatt",
                "An exclamation of surprise or admiration, often used when someone is impressed by a person's appearance.",
                "\"Gyatt, did you see that outfit?\"", 4);

        // Lesson 2: No Cap, Bussin & Slay
        Lesson lesson2 = new Lesson();
        lesson2.setTitle("No Cap, Bussin & Slay");
        lesson2.setDescription("Master the everyday expressions Gen-Alpha uses to react, agree, and hype each other up.");
        lesson2.setDifficulty("BEGINNER");
        lesson2.setObjective("Learn how to use popular Gen-Alpha reaction words and affirmations in conversation.");
        lesson2.setPublished(true);
        lesson2 = lessonRepository.save(lesson2);

        addContent(lesson2.getId(), "No Cap", "No Cap",
                "Means \"no lie\" or \"for real\" — used to emphasise that you are being completely honest.",
                "\"That movie was the best I've ever seen, no cap.\"", 1);
        addContent(lesson2.getId(), "Bussin", "Bussin",
                "Used to describe something that is extremely good, usually food but also applied broadly.",
                "\"Mum's laksa is bussin, you have to try it.\"", 2);
        addContent(lesson2.getId(), "Slay", "Slay",
                "To do something exceptionally well or look incredibly good; an expression of strong approval.",
                "\"She slayed that presentation — the whole class was impressed.\"", 3);
        addContent(lesson2.getId(), "It's giving", "It's giving",
                "Used to describe the vibe or energy something gives off.",
                "\"That outfit? It's giving main character energy.\"", 4);

        // Lesson 3: Main Character, Era & NPC
        Lesson lesson3 = new Lesson();
        lesson3.setTitle("Main Character, Era & NPC");
        lesson3.setDescription("Explore Gen-Alpha terms rooted in gaming and storytelling culture.");
        lesson3.setDifficulty("INTERMEDIATE");
        lesson3.setObjective("Understand how gaming and pop-culture concepts like main character, NPC, and era have entered everyday Gen-Alpha speech.");
        lesson3.setPublished(true);
        lesson3 = lessonRepository.save(lesson3);

        addContent(lesson3.getId(), "Main Character", "Main Character",
                "Acting as if you are the protagonist of your own life story; being confident and self-focused.",
                "\"She walked into the party like she was the main character — heads turned immediately.\"", 1);
        addContent(lesson3.getId(), "NPC", "NPC",
                "Short for Non-Player Character; used to describe someone who acts robotically, follows the crowd, or lacks original thought.",
                "\"He just agreed with everything the teacher said — total NPC behaviour.\"", 2);
        addContent(lesson3.getId(), "Era", "Era",
                "A phase or period someone is currently in, often used to describe a personal vibe or obsession.",
                "\"I'm in my study era right now — no distractions, just books.\"", 3);
        addContent(lesson3.getId(), "Understood the assignment", "Understood the assignment",
                "A compliment meaning someone did exactly what was needed, perfectly nailing the brief or expectation.",
                "\"Her Halloween costume? She completely understood the assignment.\"", 4);

        // TODO: Seed QuizQuestion data here once QuizQuestion entity is available
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
