// Title of a post in "Resultados e Fases", as a GROQ expression.
// Posts picked from the standard list in Sanity store the standard name plus, when it applies, a number and
// the "rectified" flag. Manual posts and the ones published before the standard only have the title that was typed.
export const postTitle = `select(
    defined(standardTitle) && standardTitle != "manual" =>
        select(isRectified == true => "Retificado - ", "")
        + standardTitle
        + select(
            standardTitle in ["Adendo", "Comunicado"] && defined(number) => " Nº " + select(number < 10 => "0", "") + string(number),
            ""
        ),
    title
)`;

// Name of a schedule item. Publications are picked from the same standard list as the posts,
// which is what lets the calendar find the document published for each of them (see linkPublications).
export const scheduleItemTitle = `select(
    category == "publicacao" && defined(standardTitle) && standardTitle != "manual" => standardTitle,
    title
)`;
