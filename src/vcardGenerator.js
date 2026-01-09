import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { writeFileUtf8 } from "./utils/io.js";
import { showError, showSuccess } from "./utils/show.js";

/**
 * Escape special characters for VCard
 */
function escapeVcard(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Simple validation for email and phone
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9+ ()-]+$/.test(phone);
}

/**
 * Build VCard content (VCard 4.0)
 */
function buildVcard(teacher) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:4.0",
    `UID:${crypto.randomUUID()}`,
    `FN:${escapeVcard(teacher.prenom)} ${escapeVcard(teacher.nom)}`,
    `N:${escapeVcard(teacher.nom)};${escapeVcard(teacher.prenom)};;;`,
  ];

  if (teacher.org) {
    lines.push(`ORG:${escapeVcard(teacher.org)}`);
  }

  if (teacher.email) {
    lines.push(`EMAIL;TYPE=work:${escapeVcard(teacher.email)}`);
  }

  if (teacher.tel) {
    lines.push(`TEL;TYPE=cell:${escapeVcard(teacher.tel)}`);
  }

  lines.push("END:VCARD");

  return lines.join("\n") + "\n";
}

/**
 * Generate and save the VCard
 */
export async function generateVcard(teacher) {
  if (!teacher.nom || !teacher.prenom) {
    showError("Nom et prénom sont obligatoires");
    return;
  }

  if (teacher.email && !isValidEmail(teacher.email)) {
    showError("Adresse e-mail invalide");
    return;
  }

  if (teacher.tel && !isValidPhone(teacher.tel)) {
    showError("Numéro de téléphone invalide");
    return;
  }

  const content = buildVcard(teacher);

  function formatFilenamePart(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprime les accents
    .replace(/[^a-zA-Z0-9]/g, "")    // supprime caractères spéciaux
    .replace(/^./, (c) => c.toUpperCase());
}

const safeName =
  formatFilenamePart(teacher.prenom) +
  formatFilenamePart(teacher.nom);


  const filename = `${safeName}.vcf`;
  const dirpath = path.join("./out/vcards");
  const filepath = path.join(dirpath, filename);

  await fs.mkdir(dirpath, { recursive: true });
  await writeFileUtf8(filepath, content);

  showSuccess(`Fichier VCard enregistré : ${filepath}`);
}
