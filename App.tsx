import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import type { PromptState, Character, DialogueLine } from './types';
import * as Constants from './constants';
import { TEMPLATES, TEMPLATE_OPTIONS } from './components/templates';
import CollapsibleSection from './components/CollapsibleSection';
import CharacterForm from './components/CharacterForm';
import { Input, Textarea, Select } from './components/FormControls';
import { PlusIcon, ClipboardIcon, CheckIcon, SparklesIcon, SpinnerIcon, TrashIcon } from './components/icons';

const initialState: PromptState = {
  mainDescription: '',
  characters: [],
  background: { location: '', time: '', weather: '', season: '', crowdLevel: '' },
  camera: { style: '', movement: '', angle: '', focus: '', lighting: '', colorGrading: '' },
  audio: { dialogueType: '', dialogueTone: '', dialogues: [], mood: '', ambientSound: '', backgroundMusic: '' },
  videoQuality: '',
  visualStyle: '',
  additionalDetails: '',
  aspectRatio: '',
  negativePrompt: '',
  outputModel: 'veo-3.0-generate-001',
};

const processImageFile = (file: File, maxWidth: number = 1024, maxHeight: number = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};


function App() {
  const [state, setState] = useState<PromptState>(initialState);
  const [generatedPrompts, setGeneratedPrompts] = useState({ id: '', en: '' });
  const [generatedJson, setGeneratedJson] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'json'>('text');
  const [promptLanguage, setPromptLanguage] = useState<'id' | 'en'>('id');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<string | null>(null);

  const prevCharactersRef = useRef<Character[]>([]);
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});


  const handleInputChange = useCallback(<K extends keyof PromptState>(section: K, field: keyof PromptState[K], value: string) => {
    setState(prevState => ({
      ...prevState,
      [section]: {
        ...(prevState[section] as object),
        [field]: value,
      },
    }));
  }, []);

  const handleSimpleChange = useCallback((field: keyof PromptState, value: string) => {
    setState(prevState => ({ ...prevState, [field]: value }));
  }, []);
  
  const handleInspireMe = async () => {
      setIsGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Generate a single, creative, and detailed sentence for a cinematic video prompt. Be imaginative and specific.'
        });
        handleSimpleChange('mainDescription', response.text);
      } catch (error) {
        console.error("Error generating inspiration:", error);
        alert("Gagal mendapatkan inspirasi. Silakan coba lagi.\n\nDetail Error: " + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsGenerating(false);
      }
  };

  const addCharacter = () => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      name: '',
      referenceImage: null,
      clothingReferenceImage: null,
      nationality: '',
      characteristics: '',
      clothing: '',
      mainAction: '',
      emotion: '',
    };
    setState(prevState => ({
      ...prevState,
      characters: [...prevState.characters, newCharacter],
    }));
  };

  const removeCharacter = (id: string) => {
    setState(prevState => ({
      ...prevState,
      characters: prevState.characters.filter(char => char.id !== id),
    }));
  };

  const updateCharacter = useCallback((id: string, field: keyof Character, value: any) => {
    setState(prevState => ({
      ...prevState,
      characters: prevState.characters.map(char =>
        char.id === id ? { ...char, [field]: value } : char
      ),
    }));
  }, []);
    
  const addDialogueLine = () => {
    setState(prevState => ({
      ...prevState,
      audio: {
        ...prevState.audio,
        dialogues: [
          ...prevState.audio.dialogues,
          { id: Date.now().toString(), speaker: '', content: '', language: 'Indonesia' }
        ]
      }
    }));
  };

  const removeDialogueLine = (id: string) => {
    setState(prevState => ({
      ...prevState,
      audio: {
        ...prevState.audio,
        dialogues: prevState.audio.dialogues.filter(d => d.id !== id)
      }
    }));
  };

  const updateDialogueLine = (id: string, field: 'speaker' | 'content' | 'language', value: string) => {
    setState(prevState => ({
      ...prevState,
      audio: {
        ...prevState.audio,
        dialogues: prevState.audio.dialogues.map(d =>
          d.id === id ? { ...d, [field]: value } : d
        )
      }
    }));
  };

  const getEnOption = (value: string) => value.split(' (')[0].trim();

  const handleGenerateCharacterPreview = useCallback(async (characterId: string) => {
    const character = state.characters.find(c => c.id === characterId);
    if (!character || isGeneratingPreview === characterId) return;

    if (!character.characteristics && !character.clothing && !character.referenceImage && !character.clothingReferenceImage) {
        return;
    }

    setIsGeneratingPreview(characterId);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const textPromptParts = [
            'Create a vivid, one-paragraph visual description of a character for a film script. Combine these details into a natural-sounding description.',
            character.name && `Name: ${character.name}`,
            character.nationality && `Nationality: ${character.nationality}`,
            character.characteristics && `Physical Characteristics: ${character.characteristics}`,
            character.clothing && `Clothing: ${character.clothing}`,
            character.mainAction && `They are currently: ${character.mainAction}`,
            character.emotion && `Their emotion is: ${character.emotion}`,
            'Do not add any labels or titles, just output the descriptive paragraph.'
        ];
        const textPrompt = textPromptParts.filter(Boolean).join('\n');
        
        const textResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: textPrompt
        });
        const description = textResponse.text;
        updateCharacter(characterId, 'previewDescription', description);
        
        const imageParts: any[] = [];
        const base64ToPart = (dataUri: string) => {
            const [header, base64] = dataUri.split(',');
            if (!header || !base64) return null;
            const mimeTypeMatch = header.match(/:(.*?);/);
            if (!mimeTypeMatch || !mimeTypeMatch[1]) return null;
            return {
                inlineData: {
                    mimeType: mimeTypeMatch[1],
                    data: base64,
                },
            };
        };

        if (character.referenceImage?.data) {
            const part = base64ToPart(character.referenceImage.data);
            if (part) imageParts.push(part);
        }
        if (character.clothingReferenceImage?.data) {
            const part = base64ToPart(character.clothingReferenceImage.data);
            if (part) imageParts.push(part);
        }

        let imageUrl = '';
        
        if (imageParts.length > 0) {
            const imageEditingPromptParts = [
                `Using the provided reference image(s) for the character's appearance and/or clothing, generate a new cinematic photo.`,
                `The character is described as: "${description}"`,
                 state.camera.style && `Style: ${state.camera.style}`,
                 state.camera.lighting && `Lighting: ${getEnOption(state.camera.lighting)}`,
                 state.background.location && `Background: ${state.background.location}`,
                'The final image should be hyper-realistic, detailed, and 8k.'
            ];
            const imageEditingPrompt = imageEditingPromptParts.filter(Boolean).join('. ');

            const imageEditingResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image-preview',
              contents: {
                parts: [
                  ...imageParts,
                  { text: imageEditingPrompt },
                ],
              },
              config: {
                  responseModalities: [Modality.IMAGE, Modality.TEXT],
              },
            });

            const imagePart = imageEditingResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                const base64ImageBytes = imagePart.inlineData.data;
                const mimeType = imagePart.inlineData.mimeType;
                imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
            }

        } else {
            const imagePromptParts = [
                'cinematic photo',
                description,
                state.camera.style && `style: ${state.camera.style}`,
                state.camera.lighting && `lighting: ${getEnOption(state.camera.lighting)}`,
                'hyper-realistic, detailed, 8k',
                state.background.location && `background: ${state.background.location}`,
            ];
            const imagePrompt = imagePromptParts.filter(Boolean).join(', ');
            
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: imagePrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            });

            if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
                const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
                imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            }
        }
        
        if (imageUrl) {
            updateCharacter(characterId, 'previewImageUrl', imageUrl);
        }

    } catch (error) {
        console.error("Error generating character preview:", error);
        alert("Gagal membuat pratinjau karakter. Silakan coba lagi.\n\nDetail Error: " + (error instanceof Error ? error.message : String(error)));
        updateCharacter(characterId, 'previewDescription', '');
        updateCharacter(characterId, 'previewImageUrl', '');
    } finally {
        setIsGeneratingPreview(null);
    }
  }, [state.characters, state.camera.style, state.camera.lighting, state.background.location, isGeneratingPreview, updateCharacter]);
  
  const generatePreviewRef = useRef(handleGenerateCharacterPreview);
  useEffect(() => {
    generatePreviewRef.current = handleGenerateCharacterPreview;
  });

  useEffect(() => {
    state.characters.forEach(char => {
        const prevChar = prevCharactersRef.current.find(p => p.id === char.id);
        const relevantFieldsChanged = !prevChar ||
            char.characteristics !== prevChar.characteristics ||
            char.clothing !== prevChar.clothing ||
            char.referenceImage?.data !== prevChar.referenceImage?.data ||
            char.clothingReferenceImage?.data !== prevChar.clothingReferenceImage?.data;


        if (relevantFieldsChanged) {
            if (debounceTimersRef.current[char.id]) {
                clearTimeout(debounceTimersRef.current[char.id]);
            }

            const hasContent = char.characteristics || char.clothing || char.referenceImage || char.clothingReferenceImage;

            if (hasContent) {
                debounceTimersRef.current[char.id] = setTimeout(() => {
                    generatePreviewRef.current(char.id);
                }, 1500);
            } else {
                 if (char.previewImageUrl || char.previewDescription) {
                    updateCharacter(char.id, 'previewImageUrl', '');
                    updateCharacter(char.id, 'previewDescription', '');
                }
            }
        }
    });

    prevCharactersRef.current = state.characters;

    return () => {
        Object.values(debounceTimersRef.current).forEach(clearTimeout);
    };
  }, [state.characters, updateCharacter]);

  const handleImageUpload = async (id: string, file: File | null) => {
    if (!file) {
      updateCharacter(id, 'referenceImage', null);
      return;
    }
    try {
        const processedImageDataUrl = await processImageFile(file);
        updateCharacter(id, 'referenceImage', {
            name: file.name,
            data: processedImageDataUrl,
        });
    } catch (error) {
        console.error("Error processing image:", error);
        alert("Gagal memproses gambar. Pastikan file gambar valid.");
        updateCharacter(id, 'referenceImage', null);
    }
  };

  const handleClothingImageUpload = async (id: string, file: File | null) => {
    if (!file) {
      updateCharacter(id, 'clothingReferenceImage', null);
      return;
    }
    try {
        const processedImageDataUrl = await processImageFile(file);
        updateCharacter(id, 'clothingReferenceImage', {
            name: file.name,
            data: processedImageDataUrl,
        });
    } catch (error) {
        console.error("Error processing clothing image:", error);
        alert("Gagal memproses gambar pakaian. Pastikan file gambar valid.");
        updateCharacter(id, 'clothingReferenceImage', null);
    }
  };


  const handleTemplateChange = (templateName: string) => {
    if (!templateName || !TEMPLATES[templateName]) {
        return; 
    }
    const template = TEMPLATES[templateName];
    setState(prevState => ({
        ...prevState,
        ...template,
    }));
  };
  
  const generateOutputs = () => {
    try {
      const getEnOption = (value: string) => value.split(' (')[0].trim();
      const join = (parts: (string | undefined | null)[], separator = ', '): string =>
          parts.filter(p => p && p.trim()).join(separator);

      let textOutputId = '';
      let textOutputEn = '';

      const jsonOutput = {
        main_description: state.mainDescription,
        visual_style: state.visualStyle,
        subjects: state.characters.map(char => ({
            name: char.name,
            has_reference_image: !!char.referenceImage,
            has_clothing_reference_image: !!char.clothingReferenceImage,
            nationality: char.nationality,
            characteristics: char.characteristics,
            clothing: char.clothing,
            main_action: char.mainAction,
            emotion: char.emotion,
        })),
        background: {
            location: state.background.location,
            crowd_level: state.background.crowdLevel,
            time: state.background.time,
            weather: state.background.weather,
            season: state.background.season,
        },
        camera: state.camera,
        audio: {
            dialogue_type: state.audio.dialogueType,
            dialogue_tone: state.audio.dialogueTone,
            dialogues: state.audio.dialogues.map(d => ({ speaker: d.speaker, content: d.content, language: d.language })),
            overall_mood: state.audio.mood,
            ambient_sound: state.audio.ambientSound,
            background_music: state.audio.backgroundMusic,
        },
        video_quality: state.videoQuality,
        aspect_ratio: state.aspectRatio,
        additional_details: state.additionalDetails,
        negative_prompt: state.negativePrompt,
        output_model: state.outputModel,
      };
      
      const cleanJson = JSON.parse(JSON.stringify(jsonOutput), (key, value) => {
          if (value === null || value === '') return undefined;
          if (Array.isArray(value) && value.length === 0) return undefined;
          if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return undefined;
          return value;
      });

      setGeneratedJson(JSON.stringify(cleanJson, null, 2));

      switch (state.outputModel) {
        case 'image':
          const imagePromptParts = [
            'cinematic photo',
            state.visualStyle,
            state.mainDescription,
            ...state.characters.map(char => join([char.name, char.characteristics, char.clothing])),
            state.background.location,
            state.camera.style,
            getEnOption(state.camera.lighting),
            state.videoQuality,
            getEnOption(state.aspectRatio),
            state.additionalDetails,
            'hyper-realistic, detailed, 8k',
            state.negativePrompt ? `--no ${state.negativePrompt}` : ''
          ];
          const imagePrompt = imagePromptParts.filter(Boolean).join(', ');
          textOutputId = imagePrompt;
          textOutputEn = imagePrompt;
          setActiveTab('text');
          break;
        
        case 'google flow':
          textOutputId = "Output JSON dihasilkan untuk 'google flow'. Beralih ke tab JSON untuk melihatnya.";
          textOutputEn = "JSON output generated for 'google flow'. Switch to the JSON tab to view.";
          setActiveTab('json');
          break;

        case 'veo-3.0-generate-preview':
          const previewSentences = [];
          if (state.visualStyle) previewSentences.push(`Dalam gaya ${state.visualStyle},`);
          if (state.mainDescription) previewSentences.push(state.mainDescription.trim());
          state.characters.forEach(c => {
            const charDesc = join([c.name, c.nationality, c.characteristics, `memakai ${c.clothing}`]);
            if (charDesc) previewSentences.push(charDesc);
            if(c.mainAction) previewSentences.push(`${c.name || 'karakter'} sedang ${c.mainAction}.`);
          });
          const locationDesc = join([state.background.location, state.background.time ? `pada ${state.background.time.toLowerCase()}`: ''], ' ');
          if(locationDesc) previewSentences.push(`Berlatar di ${locationDesc}.`);
          
          textOutputId = 'Pratinjau: ' + previewSentences.join(' ');
          textOutputEn = 'Preview: ' + textOutputId; // Note: Simple duplication for preview
          setActiveTab('text');
          break;

        default: // Handles veo-2.0-generate-001, veo-3.0-generate-001, etc.
            const buildPrompt = (lang: 'id' | 'en'): string => {
                const isId = lang === 'id';
                const finalPromptParagraphs: string[] = [];
                const join = (parts: (string | undefined | null)[], separator = ', '): string =>
                    parts.filter(p => p && p.trim()).join(separator);
                
                const para1_sentences: string[] = [];
                if (state.visualStyle) {
                    para1_sentences.push((isId ? `Gaya visualnya adalah ${state.visualStyle}.` : `The visual style is ${state.visualStyle}.`));
                }

                if (state.mainDescription) {
                    para1_sentences.push(state.mainDescription.trim());
                }

                state.characters.forEach(char => {
                    const charIdentity = join([ char.name, char.nationality, char.characteristics ], ', ');
                    if (charIdentity) {
                        para1_sentences.push((isId ? `Seorang karakter, ${charIdentity}.` : `The scene features a character, ${charIdentity}.`));
                    }
                    if (char.clothing) {
                        para1_sentences.push((isId ? `Ia memakai ${char.clothing}.` : `They are wearing ${char.clothing}.`));
                    }
                });

                const sceneParts = [
                    state.background.location ? (isId ? `di ${state.background.location}` : `in ${state.background.location}`) : '',
                    state.background.time ? (isId ? `pada ${state.background.time.toLowerCase()}` : `at ${state.background.time.toLowerCase()}`) : '',
                    state.background.crowdLevel ? (isId ? `dengan suasana ${state.background.crowdLevel.toLowerCase()}` : `with a ${state.background.crowdLevel.toLowerCase()} atmosphere`) : '',
                    state.background.weather ? (isId ? `, cuaca ${state.background.weather.toLowerCase()}` : `, with ${state.background.weather.toLowerCase()} weather`) : '',
                    state.background.season ? (isId ? `di ${state.background.season.toLowerCase()}` : `in the ${state.background.season.toLowerCase()}`) : ''
                ];
                const sceneSetting = join(sceneParts.filter(Boolean), ' ');
                if (sceneSetting) {
                    para1_sentences.push((isId ? `Adegan berlatar ${sceneSetting}.` : `The scene is set ${sceneSetting}.`));
                }

                state.characters.forEach(char => {
                    const actionParts = [
                        char.mainAction,
                        char.emotion ? (isId ? `dengan ekspresi ${char.emotion}` : `with an expression of ${char.emotion}`) : ''
                    ];
                    const actionSentence = join(actionParts.filter(Boolean), ' ');
                    if (actionSentence) {
                        const subject = char.name || (isId ? 'Karakter tersebut' : 'The character');
                        para1_sentences.push(`${subject} ${isId ? 'terlihat sedang' : 'is seen'} ${actionSentence}.`);
                    }
                });

                if (para1_sentences.length > 0) {
                    finalPromptParagraphs.push(para1_sentences.join(' '));
                }
                
                if (isId) {
                  const camParts = [ state.camera.style, state.camera.movement, state.camera.angle, state.camera.focus, state.camera.lighting, state.camera.colorGrading ];
                  const cameraBlock = join(camParts.filter(Boolean), ', ');
                  if (cameraBlock) finalPromptParagraphs.push('(Sinematografi) ' + cameraBlock + '.');

                  const audioSentences: string[] = [];
                   if (state.audio.dialogueType && state.audio.dialogueType !== 'Tanpa Dialog' && state.audio.dialogues.length > 0) {
                        const dialogueLines = state.audio.dialogues.map(d => {
                            if (!d.speaker || !d.content) return '';
                            const langPart = d.language ? ` (diucapkan dalam Bahasa ${d.language})` : '';
                            return `${d.speaker}: "${d.content}"${langPart}`;
                        }).filter(Boolean).join('. ');

                        if (dialogueLines) {
                            let dialogueHeader = state.audio.dialogueType;
                            if (state.audio.dialogueTone) dialogueHeader += ` dengan nada ${state.audio.dialogueTone}`;
                            audioSentences.push(`${dialogueHeader}. ${dialogueLines}`);
                        }
                    }
                  if (state.audio.ambientSound) audioSentences.push(`Suara lingkungan: ${state.audio.ambientSound}`);
                  if (state.audio.backgroundMusic) audioSentences.push(`Musik latar: ${state.audio.backgroundMusic}`);
                  if (state.audio.mood) audioSentences.push(`Mood audio keseluruhan adalah ${state.audio.mood.toLowerCase()}`);
                  if (audioSentences.length > 0) finalPromptParagraphs.push('(Audio) ' + join(audioSentences, '. ') + '.');
                  
                  const finalParts: string[] = [];
                  if (state.additionalDetails) finalParts.push(state.additionalDetails);
                  const techDetails = join([state.videoQuality, state.aspectRatio], ', ');
                  if (techDetails) finalParts.push('Spesifikasi Teknis: ' + techDetails);
                  if (state.negativePrompt) finalParts.push('Hindari: ' + state.negativePrompt);
                  if (finalParts.length > 0) finalPromptParagraphs.push(join(finalParts, '. ') + '.');

                } else {
                  const camPartsEn: string[] = [];
                  if (state.camera.style) camPartsEn.push(`- Style: ${state.camera.style}`);
                  if (state.camera.movement) camPartsEn.push(`- Camera Movement: ${getEnOption(state.camera.movement)}`);
                  if (state.camera.angle) camPartsEn.push(`- Camera Angle: ${getEnOption(state.camera.angle)}`);
                  if (state.camera.focus) camPartsEn.push(`- Focus: ${state.camera.focus}`);
                  if (state.camera.lighting) camPartsEn.push(`- Lighting: ${getEnOption(state.camera.lighting)}`);
                  if (state.camera.colorGrading) camPartsEn.push(`- Color Grading: ${state.camera.colorGrading}`);
                  if (camPartsEn.length > 0) finalPromptParagraphs.push(`Cinematography:\n${camPartsEn.join('\n')}`);

                  const audioPartsEn: string[] = [];
                  if (state.audio.dialogueType && state.audio.dialogueType !== 'Tanpa Dialog' && state.audio.dialogues.length > 0) {
                      const enDialogueType = { "Monolog": "Monologue", "Dialog": "Dialogue", "Narasi": "Narration" }[state.audio.dialogueType] || state.audio.dialogueType;
                      let dialogueHeader = `- ${enDialogueType}`;
                      if (state.audio.dialogueTone) dialogueHeader += ` (Tone: ${state.audio.dialogueTone})`;
                      audioPartsEn.push(dialogueHeader);
                      state.audio.dialogues.forEach(d => {
                          if (d.speaker && d.content) {
                              const langPartEn = d.language === 'Inggris' ? ' (in English)' : (d.language === 'Indonesia' ? ' (in Indonesian)' : '');
                              audioPartsEn.push(`  - ${d.speaker}: "${d.content}"${langPartEn}`);
                          }
                      });
                  }
                  if (state.audio.ambientSound) audioPartsEn.push(`- Ambient Sound: ${state.audio.ambientSound}`);
                  if (state.audio.backgroundMusic) audioPartsEn.push(`- Background Music: ${state.audio.backgroundMusic}`);
                  if (state.audio.mood) audioPartsEn.push(`- Overall Mood: ${state.audio.mood}`);
                  if (audioPartsEn.length > 0) finalPromptParagraphs.push(`Audio:\n${audioPartsEn.join('\n')}`);
                  
                  const finalPartsEn: string[] = [];
                  if (state.videoQuality) finalPartsEn.push(`- Video Quality: ${state.videoQuality}`);
                  if (state.aspectRatio) finalPartsEn.push(`- Aspect Ratio: ${getEnOption(state.aspectRatio)}`);
                  if (state.additionalDetails) finalPartsEn.push(`- Additional Details: ${state.additionalDetails}`);
                  if (state.negativePrompt) finalPartsEn.push(`- Negative Prompt: ${state.negativePrompt}`);
                  if (finalPartsEn.length > 0) finalPromptParagraphs.push(`Additional Notes:\n${finalPartsEn.join('\n')}`);
                }
                return finalPromptParagraphs.join('\n\n');
            };

            textOutputId = buildPrompt('id');
            textOutputEn = buildPrompt('en');
            setActiveTab('text');
            break;
      }

      setGeneratedPrompts({ id: textOutputId, en: textOutputEn });

    } catch (error) {
        console.error("Error generating outputs:", error);
        alert("Terjadi kesalahan saat membuat prompt. Silakan periksa kembali input Anda atau coba lagi.\n\nDetail Error: " + (error instanceof Error ? error.message : String(error)));
        setGeneratedPrompts({ id: '', en: '' });
        setGeneratedJson('');
    }
  };


  const copyToClipboard = () => {
    const textToCopy = activeTab === 'text' ? generatedPrompts[promptLanguage] : generatedJson;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showDialogueOptions = state.audio.dialogueType && state.audio.dialogueType !== 'Tanpa Dialog';
  const speakerOptions = ["", "Narator", ...state.characters.filter(c => c.name).map(c => c.name)];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Veo 3 <span className="text-indigo-400">Prompt Generator</span>
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Buat prompt video yang konsisten dan terstruktur dengan mudah.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Column */}
          <div className="lg:pr-4">
            <div className="mb-6 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Mulai dengan Template</h3>
                <p className="text-sm text-gray-400 mb-3">Pilih template untuk mengisi pengaturan umum secara otomatis, lalu sesuaikan.</p>
                <Select 
                  label=""
                  id="template-select" 
                  options={TEMPLATE_OPTIONS} 
                  onChange={(e) => handleTemplateChange(e.target.value)} 
                />
            </div>

            <CollapsibleSection title="Deskripsi Video Utama" isOpenDefault={true}>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="main-desc" className="block text-sm font-medium text-gray-400">
                    Deskripsi {<span className="text-red-400">*</span>}
                </label>
                <button
                    onClick={handleInspireMe}
                    disabled={isGenerating}
                    className="flex items-center gap-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-wait transition-colors"
                >
                    {isGenerating ? (
                        <>
                            <SpinnerIcon className="w-4 h-4 animate-spin" />
                            <span>Membuat...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-4 h-4" />
                            <span>Beri Inspirasi</span>
                        </>
                    )}
                </button>
              </div>
              <Textarea
                id="main-desc"
                label=""
                required
                placeholder="Contoh: Kucing bermain dengan bola benang di ruang tamu yang nyaman."
                value={state.mainDescription}
                onChange={(e) => handleSimpleChange('mainDescription', e.target.value)}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Detail Subjek">
              {state.characters.map((char, index) => (
                <CharacterForm
                  key={char.id}
                  character={char}
                  index={index}
                  updateCharacter={updateCharacter}
                  removeCharacter={removeCharacter}
                  handleImageUpload={handleImageUpload}
                  handleClothingImageUpload={handleClothingImageUpload}
                  isGeneratingPreview={isGeneratingPreview === char.id}
                />
              ))}
              <button
                onClick={addCharacter}
                className="w-full flex items-center justify-center p-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700 hover:border-gray-500 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Tambah Karakter Baru
              </button>
            </CollapsibleSection>

            <CollapsibleSection title="Latar">
                <Textarea
                    label="Lokasi"
                    id="bg-loc"
                    value={state.background.location}
                    onChange={e => handleInputChange('background', 'location', e.target.value)}
                    placeholder="Jalanan kota yang ramai di Tokyo pada malam hari, hujan turun deras"
                    rows={2}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <Select label="Tingkat Keramaian" id="bg-crowd" options={Constants.CROWD_LEVEL_OPTIONS} value={state.background.crowdLevel} onChange={e => handleInputChange('background', 'crowdLevel', e.target.value)} />
                    <Select label="Waktu" id="bg-time" options={Constants.TIME_OPTIONS} value={state.background.time} onChange={e => handleInputChange('background', 'time', e.target.value)} />
                    <Select label="Cuaca" id="bg-weather" options={Constants.WEATHER_OPTIONS} value={state.background.weather} onChange={e => handleInputChange('background', 'weather', e.target.value)} />
                    <Select label="Musim" id="bg-season" options={Constants.SEASON_OPTIONS} value={state.background.season} onChange={e => handleInputChange('background', 'season', e.target.value)} />
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Kamera">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Gaya" id="cam-style" options={Constants.STYLE_OPTIONS} value={state.camera.style} onChange={e => handleInputChange('camera', 'style', e.target.value)} />
                    <Select label="Pergerakan Kamera" id="cam-move" options={Constants.MOVEMENT_OPTIONS} value={state.camera.movement} onChange={e => handleInputChange('camera', 'movement', e.target.value)} />
                    <Select label="Sudut Kamera" id="cam-angle" options={Constants.ANGLE_OPTIONS} value={state.camera.angle} onChange={e => handleInputChange('camera', 'angle', e.target.value)} />
                    <Select label="Fokus" id="cam-focus" options={Constants.FOCUS_OPTIONS} value={state.camera.focus} onChange={e => handleInputChange('camera', 'focus', e.target.value)} />
                    <Select label="Pencahayaan" id="cam-light" options={Constants.LIGHTING_OPTIONS} value={state.camera.lighting} onChange={e => handleInputChange('camera', 'lighting', e.target.value)} />
                    <Select label="Gradasi Warna" id="cam-color" options={Constants.COLOR_GRADING_OPTIONS} value={state.camera.colorGrading} onChange={e => handleInputChange('camera', 'colorGrading', e.target.value)} />
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Audio & Suara">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Jenis Dialog" id="audio-dialogue" options={Constants.DIALOGUE_TYPE_OPTIONS} value={state.audio.dialogueType} onChange={e => handleInputChange('audio', 'dialogueType', e.target.value)} />
                    <Select label="Mood Suara Keseluruhan" id="audio-mood" options={Constants.AUDIO_MOOD_OPTIONS} value={state.audio.mood} onChange={e => handleInputChange('audio', 'mood', e.target.value)} />
                 </div>
                 {showDialogueOptions && (
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <Input 
                        label="Nada Dialog (Keseluruhan)" 
                        id="audio-tone" 
                        value={state.audio.dialogueTone} 
                        onChange={e => handleInputChange('audio', 'dialogueTone', e.target.value)} 
                        placeholder="Contoh: Gembira, marah, berbisik"
                      />
                      <div className="mt-4 space-y-4">
                        {state.audio.dialogues.map((dialogue, index) => (
                            <div key={dialogue.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className="text-sm font-semibold text-gray-300">Baris Dialog {index + 1}</h5>
                                    <button
                                        onClick={() => removeDialogueLine(dialogue.id)}
                                        className="p-1 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                                        aria-label="Hapus Dialog"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                    <div className="lg:col-span-1">
                                        <Select
                                            label="Pembicara"
                                            id={`dialogue-speaker-${dialogue.id}`}
                                            options={speakerOptions}
                                            value={dialogue.speaker}
                                            onChange={e => updateDialogueLine(dialogue.id, 'speaker', e.target.value)}
                                        />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <Select
                                            label="Bahasa"
                                            id={`dialogue-language-${dialogue.id}`}
                                            options={Constants.DIALOGUE_LANGUAGE_OPTIONS}
                                            value={dialogue.language}
                                            onChange={e => updateDialogueLine(dialogue.id, 'language', e.target.value)}
                                        />
                                    </div>
                                    <div className="lg:col-span-2">
                                        <Input
                                            label="Isi Dialog"
                                            id={`dialogue-content-${dialogue.id}`}
                                            value={dialogue.content}
                                            onChange={e => updateDialogueLine(dialogue.id, 'content', e.target.value)}
                                            placeholder="Tulis dialog di sini..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                      </div>
                      <button
                        onClick={addDialogueLine}
                        className="mt-4 w-full flex items-center justify-center p-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700 hover:border-gray-500 transition-colors"
                      >
                          <PlusIcon className="w-5 h-5 mr-2" />
                          Tambah Baris Dialog
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input label="Suara Lingkungan" id="audio-ambient" value={state.audio.ambientSound} onChange={e => handleInputChange('audio', 'ambientSound', e.target.value)} placeholder="Contoh: Suara ombak, kicauan burung" />
                    <Input label="Musik Latar" id="audio-music" value={state.audio.backgroundMusic} onChange={e => handleInputChange('audio', 'backgroundMusic', e.target.value)} placeholder="Contoh: Musik orkestra epik" />
                  </div>
            </CollapsibleSection>

            <CollapsibleSection title="Kualitas & Detail Tambahan">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select 
                        label="Gaya Visual" 
                        id="visual-style" 
                        options={Constants.VISUAL_STYLE_OPTIONS} 
                        value={state.visualStyle} 
                        onChange={e => handleSimpleChange('visualStyle', e.target.value)} 
                    />
                    <Input label="Kualitas Video" id="quality" value={state.videoQuality} onChange={e => handleSimpleChange('videoQuality', e.target.value)} placeholder="Contoh: 4K, HD, Jernih" />
                    <Select label="Rasio Aspek" id="aspect-ratio" options={Constants.ASPECT_RATIO_OPTIONS} value={state.aspectRatio} onChange={e => handleSimpleChange('aspectRatio', e.target.value)} />
                </div>
                <Textarea label="Detail Tambahan" id="details" value={state.additionalDetails} onChange={e => handleSimpleChange('additionalDetails', e.target.value)} placeholder="Tulis detail lain yang relevan di sini..." />
            </CollapsibleSection>
            
            <CollapsibleSection title="Negative Prompt">
                <Textarea 
                    label="Hal-hal yang ingin dihindari"
                    id="negative-prompt" 
                    value={state.negativePrompt} 
                    onChange={e => handleSimpleChange('negativePrompt', e.target.value)} 
                    placeholder="Contoh: Kualitas rendah, buram, teks, watermark, gambar kartun, deformasi" 
                    rows={3}
                />
                <p className="text-xs text-gray-500 -mt-2">Jelaskan elemen, gaya, atau kualitas yang tidak Anda inginkan dalam video.</p>
            </CollapsibleSection>

          </div>
          
          {/* Output Column */}
          <div className="lg:pl-4">
             <div className="sticky top-8">
                <div className="mb-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <label htmlFor="output-model" className="block text-sm font-medium text-gray-400 mb-2">
                      Target Output
                  </label>
                  <Select
                      id="output-model"
                      label=""
                      options={Constants.OUTPUT_MODEL_OPTIONS}
                      value={state.outputModel}
                      onChange={e => handleSimpleChange('outputModel', e.target.value)}
                  />
                </div>

                <button
                    onClick={generateOutputs}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 text-lg shadow-lg mb-4"
                >
                    Generate Prompt
                </button>

                <div className="bg-gray-800 rounded-lg border border-gray-700 min-h-[400px]">
                    <div className="flex justify-between items-center p-3 border-b border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="flex space-x-1 bg-gray-900 p-1 rounded-md">
                                <button onClick={() => setActiveTab('text')} className={`px-3 py-1 text-sm rounded transition-colors ${activeTab === 'text' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Teks Prompt</button>
                                <button onClick={() => setActiveTab('json')} className={`px-3 py-1 text-sm rounded transition-colors ${activeTab === 'json' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>JSON</button>
                            </div>
                            {activeTab === 'text' && (
                                <div className="flex space-x-1 bg-gray-900 p-1 rounded-md">
                                    <button onClick={() => setPromptLanguage('id')} className={`px-3 py-1 text-sm rounded transition-colors ${promptLanguage === 'id' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>ID</button>
                                    <button onClick={() => setPromptLanguage('en')} className={`px-3 py-1 text-sm rounded transition-colors ${promptLanguage === 'en' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>EN</button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={copyToClipboard}
                            disabled={(activeTab === 'text' && !generatedPrompts[promptLanguage]) || (activeTab === 'json' && !generatedJson)}
                            className="flex items-center space-x-2 bg-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {copied ? <CheckIcon/> : <ClipboardIcon/>}
                            <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                        </button>
                    </div>
                    <div className="p-4">
                        <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans">
                           {activeTab === 'text' 
                                ? (generatedPrompts[promptLanguage] || "Prompt yang Anda buat akan muncul di sini...") 
                                : (generatedJson || "Output JSON akan muncul di sini...")}
                        </pre>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
