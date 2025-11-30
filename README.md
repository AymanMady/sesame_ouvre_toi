# 🎙️ Sésame ouvre-toi ! - Magic Voice Authentication

A magical voice authentication system built with Next.js, TensorFlow.js, and Framer Motion. Users authenticate by speaking their magic phrase, which is compared to their stored voiceprint using MFCC (Mel-Frequency Cepstral Coefficients) audio fingerprinting.

![Magic Voice Auth](https://img.shields.io/badge/Voice-Authentication-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TensorFlow](https://img.shields.io/badge/TensorFlow.js-4.20-orange?style=for-the-badge&logo=tensorflow)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

- 🎤 **Voice-Based Authentication** - Login using your unique voice pattern
- 🔊 **MFCC Audio Fingerprinting** - Advanced audio feature extraction using TensorFlow.js
- 🎨 **Magical UI** - Beautiful animations with Framer Motion
- 🚪 **Animated Magic Gate** - Interactive door animation that opens on successful authentication
- 💫 **Particle Effects** - Glowing particles and visual feedback during recording
- 🌟 **Dark Magical Theme** - Purple/blue/gold gradient styling with TailwindCSS
- 📊 **Real-time Audio Visualization** - Waveform display while recording
- 🔒 **Secure Storage** - SQLite database with Prisma ORM

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Animation**: Framer Motion
- **Audio Processing**: TensorFlow.js + Web Audio API
- **Database**: SQLite with Prisma
- **Voice Processing**: Custom MFCC extraction and cosine similarity matching

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   cd sesame-ouvre-toi
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How It Works

### Registration Flow

1. User enters their email and chooses a magic phrase
2. System records 3 voice samples (2 seconds each)
3. MFCC features are extracted from each sample
4. Features are averaged and normalized to create a unique voiceprint
5. Voiceprint is stored in the database as a JSON array

### Login Flow

1. User enters their email
2. User speaks their magic phrase into the microphone
3. MFCC features are extracted from the audio
4. Cosine similarity is computed between the spoken audio and stored voiceprint
5. If similarity ≥ 85%, the magic gate opens and user is authenticated
6. If similarity < 85%, the gate shakes and authentication fails

### Voice Processing

The system uses **MFCC (Mel-Frequency Cepstral Coefficients)** for voice fingerprinting:

- **Sample Rate**: 16 kHz
- **Window Size**: 1024 samples
- **Hop Length**: 512 samples
- **MFCC Coefficients**: 13
- **Mel Filterbanks**: 40

Similarity is calculated using **cosine similarity**:

```
similarity = dot(a, b) / (||a|| * ||b||)
```

Authentication succeeds when `similarity ≥ 0.85`

## 📁 Project Structure

```
sesame-ouvre-toi/
├── app/
│   ├── api/
│   │   ├── login/route.ts          # Login API endpoint
│   │   └── register/route.ts       # Registration API endpoint
│   ├── dashboard/page.tsx          # Success page after authentication
│   ├── login/page.tsx              # Voice login page
│   ├── register/page.tsx           # Voice registration page
│   ├── globals.css                 # Global magical theme styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page (redirects to login)
├── components/
│   ├── MagicGate.tsx               # Animated door component
│   └── MicrophoneButton.tsx        # Glowing mic button with animations
├── lib/
│   ├── AudioRecorder.ts            # Web Audio API recording logic
│   ├── VoiceProcessor.ts           # MFCC extraction & similarity
│   └── prisma.ts                   # Prisma client singleton
├── prisma/
│   └── schema.prisma               # Database schema
└── package.json
```

## 🎨 UI Components

### MagicGate
- Animated double doors with magical runes
- Opens on successful authentication
- Shakes on failed authentication
- Portal effects with particles

### MicrophoneButton
- Glowing purple gradient
- Pulse animation when recording
- Audio level visualization
- Particle effects around mic

## 🗄️ Database Schema

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  magicPhrase String
  voiceprint  String   // JSON array of MFCC coefficients
  createdAt   DateTime @default(now())
}
```

## 🔧 Configuration

### Adjust Authentication Threshold

In `app/api/login/route.ts`, modify the threshold:

```typescript
const THRESHOLD = 0.85; // Default is 0.85 (85% similarity)
```

### Change Recording Duration

In `app/register/page.tsx` and `app/login/page.tsx`:

```typescript
const RECORDING_DURATION = 2000; // milliseconds
```

### Modify MFCC Parameters

In `lib/VoiceProcessor.ts`:

```typescript
private static SAMPLE_RATE = 16000;
private static FFT_SIZE = 1024;
private static N_MFCC = 13;
private static HOP_LENGTH = 512;
```

## 🎯 Usage Tips

### For Best Results:

1. **Choose a unique phrase** - Pick something memorable but distinctive
2. **Speak clearly** - Enunciate your magic phrase during registration
3. **Consistent environment** - Record in a quiet space
4. **Same tone** - Try to use the same speaking style during login
5. **Allow microphone access** - Required for voice recording

## 🐛 Troubleshooting

### Microphone Not Working
- Ensure you've granted microphone permissions in your browser
- Check if another application is using the microphone
- Try a different browser (Chrome/Edge recommended)

### Low Similarity Scores
- Re-register with clearer voice samples
- Ensure you're in a quiet environment
- Speak louder and more clearly
- Try reducing the threshold (not recommended for security)

### Database Issues
```bash
# Reset the database
npx prisma db push --force-reset

# Regenerate Prisma client
npx prisma generate
```

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma db push   # Push schema changes to database
npx prisma generate  # Regenerate Prisma client
```

## 🌟 Future Enhancements

- [ ] Add sound effects when gate opens
- [ ] Multi-factor authentication (voice + password)
- [ ] Voice profile management (update/delete)
- [ ] Support for multiple magic phrases
- [ ] Noise reduction and voice enhancement
- [ ] Mobile app version
- [ ] Real-time voice similarity feedback
- [ ] Admin dashboard for user management

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Voice processing with [TensorFlow.js](https://www.tensorflow.org/js)
- Animations with [Framer Motion](https://www.framer.com/motion/)
- Styled with [TailwindCSS](https://tailwindcss.com/)

---

**Made with ✨ magic and 🎙️ voice**
