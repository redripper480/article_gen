document.addEventListener("DOMContentLoaded", () => {
    const API_ENDPOINT = window.API_ENDPOINT || "http://localhost:3000/generate_article"
    // DOM Elements for Title Generator
    const keywordInput = document.querySelector("#title-generator .form-control")
    const generateTitlesBtn = document.querySelector("#title-generator .btn-primary")
    const titleResults = document.querySelector("#title-generator .results")
  
    // DOM Elements for Selected Title Workshop
    const generateOutlinesBtn = document.getElementById("generateOutlines")
    const regenerateOutlinesBtn = document.getElementById("regenerateOutlines")
    const regenerateButtons = document.querySelectorAll(".regenerate-btn")
    const selectedTitleInput = document.getElementById("selectedTitle")
    const outlineBoxes = document.querySelectorAll(".outline-box")
    const loadingIndicators = document.querySelectorAll(".loading-indicator")
    const outlineCheckboxes = document.querySelectorAll("#selected-title .form-check-input")
    const writeArticleBtn = document.getElementById("writeArticle")
    const articleDisplay = document.getElementById("articleDisplay")
    const articleProgress = document.getElementById("articleProgress")
  
    // Null checks for critical DOM elements
    if (!keywordInput || !generateTitlesBtn || !titleResults || !selectedTitleInput || !articleDisplay) {
      console.error("One or more critical DOM elements are missing.")
      return
    }
  
    // Function to show loading state for titles
    function showLoading() {
      if (generateTitlesBtn) {
        generateTitlesBtn.disabled = true
        generateTitlesBtn.textContent = "Generating..."
      }
      if (titleResults) {
        titleResults.innerHTML = '<div class="text-muted">Loading titles...</div>'
      }
    }
  
    // Function to display title results without numbering or dashes
    function displayResults(titles) {
      if (!titleResults) return
      titleResults.innerHTML = ""
      titles.forEach((title, index) => {
        const titleDiv = document.createElement("div")
        titleDiv.className = "d-flex align-items-center mb-2 p-2 bg-light border rounded"
  
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.className = "form-check-input me-2"
        checkbox.id = `title-check-${index}`
        checkbox.addEventListener("change", () => {
          if (checkbox.checked && selectedTitleInput) {
            selectedTitleInput.value = titleInput.value
            titleResults.querySelectorAll(".bg-primary").forEach((el) => el.classList.remove("bg-primary", "text-white"))
            titleDiv.classList.add("bg-primary", "text-white")
            titleResults.querySelectorAll(".form-check-input").forEach((cb) => {
              if (cb !== checkbox) cb.checked = false
            })
          }
        })
  
        const titleInput = document.createElement("input")
        titleInput.type = "text"
        titleInput.className = "form-control me-2"
        titleInput.value = title
        titleInput.addEventListener("click", () => {
          if (selectedTitleInput) {
            selectedTitleInput.value = titleInput.value
            titleResults.querySelectorAll(".bg-primary").forEach((el) => el.classList.remove("bg-primary", "text-white"))
            titleDiv.classList.add("bg-primary", "text-white")
            checkbox.checked = true
            titleResults.querySelectorAll(".form-check-input").forEach((cb) => {
              if (cb !== checkbox) cb.checked = false
            })
          }
        })
        titleInput.addEventListener("input", () => {
          if (titleDiv.classList.contains("bg-primary") && selectedTitleInput) {
            selectedTitleInput.value = titleInput.value
          }
          updateCharCount(titleInput, charCountSpan)
        })
  
        const copyBtn = document.createElement("button")
        copyBtn.className = "btn btn-sm btn-outline-secondary me-2"
        copyBtn.textContent = "Copy"
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(titleInput.value).then(() => {
            copyBtn.textContent = "Copied"
            setTimeout(() => (copyBtn.textContent = "Copy"), 2000)
          })
        })
  
        const charCountSpan = document.createElement("span")
        charCountSpan.className = "text-muted small"
        charCountSpan.textContent = `${titleInput.value.length} chars`
  
        function updateCharCount(input, span) {
          span.textContent = `${input.value.length} chars`
        }
  
        titleDiv.appendChild(checkbox)
        titleDiv.appendChild(titleInput)
        titleDiv.appendChild(copyBtn)
        titleDiv.appendChild(charCountSpan)
        titleResults.appendChild(titleDiv)
        updateCharCount(titleInput, charCountSpan) // Initial char count
      })
    }
  
    // Generate titles function without numbering or dashes
    async function generateTitles() {
      const keywords = keywordInput.value.trim()
      if (!keywords) {
        alert("Please enter keywords first!")
        return
      }
  
      showLoading()
  
      try {
        const prompt = `As an SEO expert, generate 15 unique and compelling titles based on the keyword "${keywords}".
          Search current trends and insights related to "${keywords}" to inspire fresh, relevant titles.
          Follow these rules:
          1. Keep each title around 50-60 characters (10-12 words).
          2. Include 10-15% emotional words (e.g., amazing, urgent, secrets) to evoke feelings or curiosity.
          3. Use at least one power word/phrase (e.g., ultimate, boost, master) to grab attention.
          4. Mix 20-30% common words (e.g., the, and, to) and 10-20% uncommon words (e.g., unleash, soar, epic) for balance.
          5. Ensure positive sentiment, avoiding negative or controversial language.
          6. Maximize click-through rates (CTR) on Google with attention-grabbing, relevant titles.
          7. Engage readers by piquing interest and creating a desire to learn more.
          Return the titles as a plain list, one per line, without numbering (e.g., no "1.", "2.") or dashes (e.g., no "-"), no duplicates.
          Ensure freshness by reflecting current search trends for "${keywords}".
          Remember, the goal is to create compelling, click-worthy titles that effectively incorporate the "${keywords}" while adhering to best practices for SEO and reader engagement.`
  
        const data = {}
        data["prompt"] = prompt
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
  
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }
  
        const result = await response.json()
        const titlesText = result.article.trim()
        const titles = titlesText
          .split("\n")
          .map((line) => line.replace(/^[-0-9]+\.\s*|-+\s*/, "").trim())
          .filter((line) => line.length >= 40 && line.length <= 70)
          .slice(0, 15)
  
        if (titles.length < 15) {
          console.warn("API returned fewer than 15 titles:", titles.length)
        }
  
        displayResults(titles)
      } catch (error) {
        console.error("Error generating titles:", error)
        if (titleResults) {
          titleResults.innerHTML = `
                      <div class="alert alert-danger">
                          Error: ${error.message}. Please check your API key or try again later.
                      </div>
                  `
        }
      } finally {
        if (generateTitlesBtn) {
          generateTitlesBtn.disabled = false
          generateTitlesBtn.textContent = "Generate Titles"
        }
      }
    }
  
    // Function to handle title generation
    function handleGenerateTitles() {
      generateTitles()
    }
  
    // Function to display article with SEO-optimized formatting
    function displayArticle(articleText) {
      if (!articleDisplay) return
      articleDisplay.innerHTML = ""
  
      const lines = articleText.split("\n").filter((line) => line.trim())
      let currentElement = null
  
      lines.forEach((line) => {
        if (line.startsWith("h1 ")) {
          currentElement = document.createElement("h1")
          currentElement.textContent = line.replace("h1 ", "").trim()
          articleDisplay.appendChild(currentElement)
        } else if (line.startsWith("h2 ")) {
          currentElement = document.createElement("h2")
          currentElement.textContent = line.replace("h2 ", "").trim()
          articleDisplay.appendChild(currentElement)
        } else if (line.trim()) {
          const p = document.createElement("p")
          p.textContent = line.trim()
          articleDisplay.appendChild(p)
        }
      })
    }
  
    // Modified Function to generate article
    async function handleWriteArticle() {
      const title = selectedTitleInput.value.trim()
      const seedKeyword = keywordInput.value.trim()
  
      if (!title) {
        alert("Please select a title first!")
        return
      }
      if (!seedKeyword) {
        alert("Please enter a seed keyword in the Title Generator!")
        return
      }
  
      let selectedOutlineIndex = -1
      outlineCheckboxes.forEach((cb, index) => {
        if (cb.value === "yes") {
          selectedOutlineIndex = index
        }
      })
  
      if (selectedOutlineIndex === -1) {
        alert("Please check one outline box to generate the article!")
        return
      }
  
      const selectedOutline = outlineBoxes[selectedOutlineIndex]?.value.trim()
      if (!selectedOutline) {
        alert("The selected outline is empty!")
        return
      }
  
      if (articleProgress && writeArticleBtn) {
        articleProgress.classList.remove("d-none")
        writeArticleBtn.disabled = true
        let progress = 0
        const progressBar = articleProgress.querySelector(".progress-bar")
        if (progressBar) {
          progressBar.style.width = `${progress}%`
          progressBar.setAttribute("aria-valuenow", progress)
        }
  
        const progressInterval = setInterval(() => {
          progress += 10
          if (progress <= 90 && progressBar) {
            progressBar.style.width = `${progress}%`
            progressBar.setAttribute("aria-valuenow", progress)
          }
        }, 500)
  
        const outlineLines = selectedOutline
          .split("\n")
          .map((line) => line.replace(/^\d+\.\s*/, "").trim())
          .filter((line) => line && line.toLowerCase() !== "introduction")
  
        const hasFAQs = outlineLines.some(
          (line) =>
            line.toLowerCase() === "faqs" ||
            line.toLowerCase() === "faq’s" ||
            line.toLowerCase() === "frequently asked questions",
        )
        const hasConclusion = outlineLines.some((line) => line.toLowerCase() === "conclusion")
        if (!hasFAQs) outlineLines.push("FAQs")
        if (!hasConclusion) outlineLines.push("Conclusion")
  
        const prompt = `
                  You are a content writer specializing in SEO optimization. Your task is to create an article based on the provided title and seed keyword. Please adhere to the following instructions for structure and content quality:
  
                  ### Article Creation Prompt:
  
                  1. **Title and Keywords:**
                     - Write an article for the topic "${title}" using the seed keyword "${seedKeyword}".
  
                  2. **Structure:**
                     - **H1 Heading:** Start with "${title}" as the main heading.
                     - **Introduction (H2 Heading):**
                       - Write an engaging introduction consisting of two paragraphs. 
                       - Ensure each paragraph is a minimum of 300 words, starting with the seed keyword "${seedKeyword}" naturally within the first or second sentence.
                       - Use clear, concise language and avoid passive voice. 
  
                  3. **Content Guidelines:**
                     - For each heading outlined in ${outlineLines.join(", ")}, create an H2 heading followed by:
                       - Two paragraphs (minimum 300 words each) that relate directly to "${title}" and "${seedKeyword}".
                       - Use subheadings and bullet points as needed to enhance clarity and readability.
                       - Maintain active voice and sentences under 18 words. Use simple vocabulary suitable for 11th-12th graders.
                       - Ensure each section flows smoothly toward a cohesive article.
  
                  4. **FAQs Section:**
                     - You are a knowledgeable content creator with expertise in crafting engaging and informative FAQs. You have a talent for researching common questions and providing concise, clear answers that help readers understand complex topics easily. 
                     - Your task is to generate a list of the most common FAQs related to "${seedKeyword}" and "${title}". 
                     - Please provide a minimum of five FAQs along with their answers. Each answer should be short, limited to 150 words, and clearly explain the topic while being easily understandable to a general audience. 
                     - Keep in mind that the FAQs should be relevant and researchable, ensuring they address the most pressing questions people might have about "${seedKeyword}" and "${title}". 
                     - For example, if the seed keyword is "digital marketing" and the title is "Beginner's Guide," the FAQs might include questions like "What is digital marketing?" and "How do I start a digital marketing campaign?"
                     - Add this as a separate section titled "FAQs" if it's not already in the outline.
  
                  5. **Conclusion (H2 Heading):**
                     - Write a concluding section with two paragraphs (minimum 300 words each).
                     - Mention "${seedKeyword}" at least once, summarizing the key points discussed in the article.
                     - Maintain active voice, simple language, and the same sentence structure guidelines.
  
                  6. **SEO Optimization:**
                     - Aim for a keyword density of 1-2% for "${seedKeyword}" throughout the article.
                     - Incorporate semantic keywords to enhance context and relevance.
                     - Use transition words to ensure the content flows well from one point to the next.
  
                  7. **Final Review:**
                     - Edit for spelling and grammar errors.
                     - Minimize the use of adverbs.
                     - Ensure clarity and understanding at each step.
  
                  Return the complete article in plain text format with appropriate H1 and H2 headings, without additional formatting or markup beyond line breaks.
              `
  
        try {
          const data = {}
          data["prompt"] = prompt
          const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
  
          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`)
          }
  
          const result = await response.json()
          const articleText = result.article.trim()
  
          progress = 100
          if (progressBar) {
            progressBar.style.width = `${progress}%`
            progressBar.setAttribute("aria-valuenow", progress)
          }
          setTimeout(() => {
            if (articleProgress) articleProgress.classList.add("d-none")
            if (writeArticleBtn) writeArticleBtn.disabled = false
            clearInterval(progressInterval)
            displayArticle(articleText)
          }, 500)
        } catch (error) {
          console.error("API Error (Article):", error)
          let fallbackArticle = `h1 ${title}\n\nh2 Introduction\n\n`
          fallbackArticle += `${seedKeyword} helps you succeed online easily. Readers enjoy simple tips. You learn fast with clear steps. Start today with small actions. Focus on key ideas daily. Tools make growth fun for everyone. Practice builds skills step by step. Enjoy seeing quick results now. Beginners find this guide super helpful. Use these ideas to improve fast. Success comes with regular effort. Keep learning every day with ease.\n\n`
          fallbackArticle += `New tricks boost your skills quickly. Try fresh ideas each day. Simple steps lead to big wins. You control your path to mastery. Readers like short examples a lot. Goals stay clear with this guide. Stay active in learning daily. Tools help you move forward easily. Enjoy progress with every small step. This fits 12th-grade readers perfectly. Keep it fun and simple always.\n\n`
  
          outlineLines.forEach((line) => {
            const heading = line.toLowerCase()
            if (heading === "faqs" || heading === "faq’s" || heading === "frequently asked questions") {
              fallbackArticle += `h2 FAQs\n\n`
              fallbackArticle += `Q: What is ${seedKeyword} about?\nA: ${seedKeyword} covers key ideas simply. You explore it with ease today. It helps solve common problems fast. Readers understand it without confusion. Check current trends for more.\n\n`
              fallbackArticle += `Q: How does ${seedKeyword} work?\nA: ${seedKeyword} works by guiding you clearly. You follow steps to see results. It uses tools and ideas daily. Readers find success with practice. Look online for updated methods.\n\n`
              fallbackArticle += `Q: Why use ${seedKeyword} today?\nA: ${seedKeyword} fits today’s needs perfectly. You gain benefits quickly now. It keeps you ahead of trends. Readers enjoy relevant solutions always. Search current insights for details.\n\n`
              fallbackArticle += `Q: Who should try ${seedKeyword}?\nA: ${seedKeyword} suits beginners and experts alike. You start with simple actions. It grows skills for everyone fast. Readers benefit from clear tips. Explore online forums for more.\n\n`
              fallbackArticle += `Q: What’s new with ${seedKeyword}?\nA: ${seedKeyword} evolves with fresh trends. You discover updates online easily. It offers new ways to succeed. Readers stay informed with research. Check recent sources for news.\n\n`
            } else if (heading === "conclusion") {
              fallbackArticle += `h2 Conclusion\n\n`
              fallbackArticle += `${seedKeyword} drives success for you daily. Readers enjoy clear tips here. You grow fast with simple steps. Tools help every day a lot. Practice makes skills strong quickly. Start now to see big wins. Enjoy learning with this guide. Success fits 11th-grade readers well.\n\n`
              fallbackArticle += `You master ideas with ease now. Try new tricks every day. Simple actions boost growth fast. Readers like short examples always. Goals stay clear for you here. Keep moving forward with fun. This guide wraps up key points. Enjoy your journey to success.\n\n`
            } else {
              fallbackArticle += `h2 ${heading}\n\n`
              fallbackArticle += `You learn ${heading} with ease today. ${seedKeyword} helps you grow fast. Start with simple steps now. Readers enjoy clear ideas daily. Focus on key points always. Tools make tasks fun for you. Practice builds skills step by step. Enjoy quick wins every time.\n\n`
              fallbackArticle += `${heading} boosts your success daily. You try fresh ideas now. Simple tricks work well for everyone. Readers find examples easy to follow. Use tools to speed up growth. Stay active with short goals. Enjoy seeing progress every day. This fits 11th-grade readers perfectly.\n\n`
            }
          })
  
          progress = 100
          if (progressBar) {
            progressBar.style.width = `${progress}%`
            progressBar.setAttribute("aria-valuenow", progress)
          }
          setTimeout(() => {
            if (articleProgress) articleProgress.classList.add("d-none")
            if (writeArticleBtn) writeArticleBtn.disabled = false
            clearInterval(progressInterval)
            displayArticle(fallbackArticle)
          }, 500)
        }
      }
    }
  
    // Outline generation functions
    async function generateOutline1(keywords, title) {
      const prompt = `
              You are an AI content strategist specialized in creating SEO-optimized outlines for articles. 
              Upon receiving a selected title and a seed keyword, your task is to generate a minimum of 8 to 10 structured outline points. 
              Each headline should consist of 2 to 10 words, and one of the headlines must incorporate the provided seed keyword "${keywords}".
              Your response should be formatted as follows:
              1. Introduction  
              2. (Generated headline 1)  
              3. (Generated headline 2)  
              4. (Generated headline 3)  
              5. (Generated headline 4)  
              6. (Generated headline 5)  
              7. (Generated headline 6)  
              8. (Generated headline 7)  
              9. (Generated headline 8)  
              10. (Generated headline 9)  
              11. (Generated headline 10)  
              12. FAQs  
              13. Conclusion  
              Provide only the headings without descriptions, numbered from 1 to 13, ensuring the outline is SEO-optimized for the title "${title}" and seed keyword "${keywords}".
          `
      const data = {}
      data["prompt"] = prompt
      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        
        const result = await response.json()
        
        return result.article.split("\n").map((line) => line.trim())
      } catch (error) {
        return [`There was an error generating the outline. Please Try again ${error}`]
      }
      // try {
      //     const response = await fetch(GEMINI_API_URL, {
      //         method: 'POST',
      //         headers: {
      //             'Content-Type': 'application/json',
      //             'Authorization': `Bearer ${GEMINI_API_KEY}`
      //         },
      //         body: JSON.stringify({
      //             model: MODEL_ID,
      //             messages: [{ role: 'user', content: prompt }]
      //         })
      //     });
      //     if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      //     const data = await response.json();
      //     if (!data.choices || !data.choices[0].message) throw new Error('Unexpected API response format');
      //     const outlineText = data.choices[0].message.content.trim();
      //     const outline = outlineText.split('\n').map(line => line.trim());
      //     return outline.slice(0, 13);
      // } catch (error) {
      //     console.error('API Error (Outline 1):', error);
      //     return [
      //         "1. Introduction",
      //         "2. Why This Topic Matters",
      //         "3. Key Benefits Unveiled",
      //         "4. Essential Steps to Start",
      //         `5. Mastering ${keywords} Today`,
      //         "6. Common Mistakes to Avoid",
      //         "7. Tools for Success",
      //         "8. Future Trends Ahead",
      //         "9. Boosting Your Results",
      //         "10. Practical Tips for Growth",
      //         "11. Next Steps to Take",
      //         "12. FAQs",
      //         "13. Conclusion"
      //     ];
      // }
    }
  
    async function generateOutline2(keywords, title) {
      const prompt = `
          You are an expert content strategist with extensive experience in creating SEO-optimized outlines for articles. 
          Your specialty lies in generating clear, structured outlines that effectively incorporate seed keywords and relevant topics to enhance search engine visibility.
          Your task is to generate an SEO-optimized outline based on the provided title and seed keyword. 
          Here are the details you need to consider:  
          Selected Title: "${title}"  
          Seed Keyword: "${keywords}"  
          Please generate a minimum of 8 to 10 outline headings related to the selected title. 
          Each heading should consist of 2 to 10 words, and at least one heading must include the seed keyword "${keywords}". 
          After generating the outlines, provide the following structure:  
          Introduction  
          (generated headline 1)  
          (generated headline 2)  
          (generated headline 3)  
          (generated headline 4)  
          (generated headline 5)  
          (generated headline 6)  
          (generated headline 7)  
          (generated headline 8)  
          (generated headline 9)  
          (generated headline 10)  
          Frequently Asked Questions (minimum 5 FAQs)  
          Conclusion  
          Provide only the headings without descriptions, numbered from 1 to 13, ensuring the outline is SEO-optimized for the title "${title}" and seed keyword "${keywords}".
      `
      const data = {}
      data["prompt"] = prompt
      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        
        const result = await response.json()
        
        return result.article
          .split("\n")
          .map((line, index) => `${index + 1}. ${line}`)
          .slice(0, 13)
      } catch (error) {
        console.error("API Error (Outline 2):", error)
        return [
          "1. Introduction",
          "2. Exploring Core Concepts",
          "3. Why It Matters Now",
          "4. Steps to Get Started",
          `5. Using ${keywords} Effectively`,
          "6. Avoiding Common Pitfalls",
          "7. Essential Tools Overview",
          "8. Trends Shaping Future",
          "9. Maximizing Your Impact",
          "10. Actionable Growth Strategies",
          "11. Next Steps Forward",
          "12. Frequently Asked Questions",
          "13. Conclusion",
        ]
      }
    }
  
    async function generateOutline3(keywords, title) {
      const prompt = `
          Generate an SEO-optimized outline for an article based on the following parameters:
          - Selected Title: "${title}"
          - Seed Keyword: "${keywords}"
          Instructions:
          1. Generate a minimum of 8 to 10 SEO-optimized outlines based on the selected title and seed keyword.
          2. Each headline should consist of a minimum of 2 words and a maximum of 10 words.
          3. Ensure that one of the headlines explicitly includes the seed keyword "${keywords}".
          4. Format the output as follows:
          1. Introduction
          2. (generated headline 1)
          3. (generated headline 2)
          4. (generated headline 3)
          5. (generated headline 4)
          6. (generated headline 5)
          7. (generated headline 6)
          8. (generated headline 7)
          9. (generated headline 8)
          10. (generated headline 9)
          11. (generated headline 10)
          12. FAQ's
          13. Conclusion
          Provide only the headings without descriptions, numbered from 1 to 13. Do not include the total number of outlines created in the output.
      `
      const data = {}
      data["prompt"] = prompt
      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        
        const result = await response.json()
        
        return result.article.split("\n").map((line) => line.trim())
      } catch (error) {
        console.error("API Error (Outline 3):", error)
        return [
          "1. Introduction",
          "2. Core Concepts Explained",
          "3. Why It's Relevant Now",
          "4. Getting Started Easily",
          `5. Leveraging ${keywords} Benefits`,
          "6. Avoiding Typical Errors",
          "7. Top Tools Recommended",
          "8. Future Insights Revealed",
          "9. Enhancing Your Strategy",
          "10. Practical Success Tips",
          "11. Moving Forward Confidently",
          "12. FAQ's",
          "13. Conclusion",
        ]
      }
    }
  
    // Function to display outline with regular text (editable)
    function displayOutline(outlineBox, outline) {
      if (!outlineBox) return
      const formattedOutline = outline.map((heading) => heading.trim()).join("\n")
      outlineBox.value = formattedOutline
      outlineBox.style.fontFamily = "'Segoe UI', sans-serif"
      outlineBox.style.padding = "10px"
    }
  
    // Function to handle outline generation with different methods
    async function handleGenerateOutlines() {
      const title = selectedTitleInput.value.trim()
      const keywords = keywordInput.value.trim()
  
      if (!title || !keywords) {
        alert("Please enter a seed keyword and select a title first!")
        return
      }
  
      outlineBoxes.forEach((box, index) => {
        if (loadingIndicators[index]) loadingIndicators[index].classList.remove("d-none")
        if (box) box.disabled = true
      })
  
      try {
        const outlines = await Promise.all([
          generateOutline1(keywords, title),
          generateOutline2(keywords, title),
          generateOutline3(keywords, title),
        ])
        console.log(outlines)
        outlines.forEach((outline, index) => {
          displayOutline(outlineBoxes[index], outline)
          if (loadingIndicators[index]) loadingIndicators[index].classList.add("d-none")
          if (outlineBoxes[index]) outlineBoxes[index].disabled = false
        })
  
        outlineCheckboxes.forEach((cb) => (cb.checked = false))
      } catch (error) {
        console.error("Error generating outlines:", error)
        alert("Failed to generate outlines. Please try again.")
        outlineBoxes.forEach((box, index) => {
          if (loadingIndicators[index]) loadingIndicators[index].classList.add("d-none")
          if (box) box.disabled = false
        })
      }
    }
  
    // Function to regenerate single outline
    async function regenerateSingleOutline(index) {
      const title = selectedTitleInput.value.trim()
      const keywords = keywordInput.value.trim()
  
      if (!title || !keywords) {
        alert("Please enter a seed keyword and select a title first!")
        return
      }
  
      if (loadingIndicators[index]) loadingIndicators[index].classList.remove("d-none")
      if (outlineBoxes[index]) outlineBoxes[index].disabled = true
  
      try {
        let outline
        if (index === 0) outline = await generateOutline1(keywords, title)
        else if (index === 1) outline = await generateOutline2(keywords, title)
        else outline = await generateOutline3(keywords, title)
  
        displayOutline(outlineBoxes[index], outline)
        if (loadingIndicators[index]) loadingIndicators[index].classList.add("d-none")
        if (outlineBoxes[index]) outlineBoxes[index].disabled = false
      } catch (error) {
        console.error(`Error regenerating outline ${index + 1}:`, error)
        if (loadingIndicators[index]) loadingIndicators[index].classList.add("d-none")
        if (outlineBoxes[index]) outlineBoxes[index].disabled = false
      }
    }
  
    // Function to handle outline checkbox functionality (only one checked at a time)
    function setupOutlineCheckboxes() {
      outlineCheckboxes.forEach((checkbox, index) => {
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            outlineCheckboxes.forEach((cb, i) => {
              if (i === index) {
                cb.value = "yes"
              } else {
                cb.checked = false
                cb.value = "no"
              }
            })
          } else {
            checkbox.value = "no"
          }
        })
      })
    }
  
    // Function to copy article text from articleDisplay
    function copyArticle() {
      const copyArticleBtn = document.getElementById("copyArticle")
      if (!articleDisplay.textContent.trim()) {
        alert("No article text to copy!")
        return
      }
  
      const articleText = articleDisplay.textContent.trim()
      navigator.clipboard
        .writeText(articleText)
        .then(() => {
          if (copyArticleBtn) {
            copyArticleBtn.textContent = "Copied"
            setTimeout(() => (copyBtn.textContent = "Copy"), 2000)
          }
        })
        .catch((err) => {
          console.error("Failed to copy article:", err)
          alert("Failed to copy article. Please try again.")
        })
    }
  
    // Function to update word count for articleDisplay
    function updateWordCount() {
      const wordCountSpan = document.getElementById("wordCount")
      if (!wordCountSpan) return
  
      const text = articleDisplay.textContent.trim()
      const words = text ? text.split(/\s+/).filter((word) => word.length > 0).length : 0
      wordCountSpan.textContent = `${words} words`
    }
  
    // Function to update character count for articleDisplay
    function updateCharCount() {
      const charCountSpan = document.getElementById("charCount")
      if (!charCountSpan) return
  
      const text = articleDisplay.textContent.trim()
      const chars = text.length
      charCountSpan.textContent = `${chars} characters`
    }
  
    // Event Listeners
    if (generateTitlesBtn) generateTitlesBtn.addEventListener("click", handleGenerateTitles)
    if (generateOutlinesBtn) generateOutlinesBtn.addEventListener("click", handleGenerateOutlines)
    if (regenerateOutlinesBtn) regenerateOutlinesBtn.addEventListener("click", handleGenerateOutlines)
    if (regenerateButtons) {
      regenerateButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => regenerateSingleOutline(index))
      })
    }
    if (writeArticleBtn) writeArticleBtn.addEventListener("click", handleWriteArticle)
  
    // Setup outline checkboxes functionality
    setupOutlineCheckboxes()
  
    // Additional button handlers
    const generateArticleBtn = document.getElementById("generateArticle")
    if (generateArticleBtn) {
      generateArticleBtn.addEventListener("click", () => {
        alert("Article generation feature coming soon!")
      })
    }
  
    const searchGoogleBtn = document.getElementById("searchGoogle")
    if (searchGoogleBtn) {
      searchGoogleBtn.addEventListener("click", () => {
        const title = selectedTitleInput.value.trim()
        if (title) {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(title)}`, "_blank")
        } else {
          alert("Please enter or select a title first!")
        }
      })
    }
  
    const generateStepByStepBtn = document.getElementById("generateStepByStep")
    if (generateStepByStepBtn) {
      generateStepByStepBtn.addEventListener("click", () => {
        alert("Step-by-step guide feature coming soon!")
      })
    }
  
    // Add event listener for copyArticle button and setup observer for word/char counts
    const copyArticleBtn = document.getElementById("copyArticle")
    if (copyArticleBtn) {
      copyArticleBtn.addEventListener("click", copyArticle)
    }
  
    // Observe changes to articleDisplay to update counts
    const observer = new MutationObserver(() => {
      updateWordCount()
      updateCharCount()
    })
    observer.observe(articleDisplay, { childList: true, subtree: true, characterData: true })
  
    // Initial count update
    updateWordCount()
    updateCharCount()
  })
  
  