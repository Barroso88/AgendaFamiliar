const fs = require('fs');

let content = fs.readFileSync('app.js', 'utf8');

const replacements = [
    {
        // Último Veterinário
        search: /<div class="p-3 rounded-xl bg-white\/70 dark:bg-gray-900\/25">\s*<div class="flex items-center justify-between gap-2 mb-2">\s*<p class="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Último Veterinário<\/p>/,
        replace: `<div class="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-md shadow-rose-500/10 border border-rose-100 dark:border-rose-900/50 ring-1 ring-rose-50 dark:ring-rose-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800 shadow-sm">Último Veterinário</span>`
    },
    {
        // Próxima Consulta
        search: /<div class="p-3 rounded-xl bg-white\/70 dark:bg-gray-900\/25">\s*<div class="flex items-center justify-between gap-2 mb-2">\s*<p class="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">Próxima \$\{consultPrefix\}<\/p>/,
        replace: `<div class="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-md shadow-sky-500/10 border border-sky-100 dark:border-sky-900/50 ring-1 ring-sky-50 dark:ring-sky-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800 shadow-sm">Próxima \${consultPrefix}</span>`
    },
    {
        // Última Vacina
        search: /<div class="p-3 rounded-xl bg-white\/70 dark:bg-gray-900\/25">\s*<div class="flex items-center justify-between gap-2 mb-2">\s*<p class="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Última Vacina<\/p>/g,
        replace: `<div class="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-md shadow-rose-500/10 border border-rose-100 dark:border-rose-900/50 ring-1 ring-rose-50 dark:ring-rose-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800 shadow-sm">Última Vacina</span>`
    },
    {
        // Próxima Vacina
        search: /<div class="p-3 rounded-xl bg-white\/70 dark:bg-gray-900\/25">\s*<div class="flex items-center justify-between gap-2 mb-2">\s*<p class="text-xs font-semibold uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-300">Próxima Vacina<\/p>/,
        replace: `<div class="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-md shadow-fuchsia-500/10 border border-fuchsia-100 dark:border-fuchsia-900/50 ring-1 ring-fuchsia-50 dark:ring-fuchsia-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 dark:bg-fuchsia-900/50 dark:text-fuchsia-300 dark:border-fuchsia-800 shadow-sm">Próxima Vacina</span>`
    },
    {
        // Último Banho
        search: /<div class="p-3 rounded-xl bg-white\/70 dark:bg-gray-900\/25">\s*<div class="flex items-center justify-between gap-2 mb-2">\s*<p class="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">Último Banho<\/p>/,
        replace: `<div class="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-md shadow-blue-500/10 border border-blue-100 dark:border-blue-900/50 ring-1 ring-blue-50 dark:ring-blue-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800 shadow-sm">Último Banho</span>`
    },
    {
        // Próximo Banho
        search: /<div class="p-3 rounded-xl bg-white\/70 dark:bg-gray-900\/25">\s*<div class="flex items-center justify-between gap-2 mb-2">\s*<p class="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">Próximo Banho<\/p>/,
        replace: `<div class="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-md shadow-cyan-500/10 border border-cyan-100 dark:border-cyan-900/50 ring-1 ring-cyan-50 dark:ring-cyan-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800 shadow-sm">Próximo Banho</span>`
    },
    {
        // Última Tosa
        search: /<div class="p-3 rounded-xl bg-white\/70 dark:bg-gray-900\/25">\s*<div class="flex items-center justify-between gap-2 mb-2">\s*<p class="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">Última Tosa<\/p>/,
        replace: `<div class="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-md shadow-purple-500/10 border border-purple-100 dark:border-purple-900/50 ring-1 ring-purple-50 dark:ring-purple-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800 shadow-sm">Última Tosa</span>`
    },
    {
        // Próxima Tosa
        search: /<div class="p-3 rounded-xl bg-white\/70 dark:bg-gray-900\/25">\s*<div class="flex items-center justify-between gap-2 mb-2">\s*<p class="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">Próxima Tosa<\/p>/,
        replace: `<div class="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-md shadow-violet-500/10 border border-violet-100 dark:border-violet-900/50 ring-1 ring-violet-50 dark:ring-violet-900/30">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800 shadow-sm">Próxima Tosa</span>`
    }
];

let changedCount = 0;
for (const r of replacements) {
    if (content.match(r.search)) {
        content = content.replace(r.search, r.replace);
        changedCount++;
    } else {
        console.log("NOT FOUND:", r.search);
    }
}

console.log("Changed", changedCount, "items");

fs.writeFileSync('app.js', content, 'utf8');
