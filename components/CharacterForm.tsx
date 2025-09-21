import React from 'react';
import type { Character } from '../types';
import { Input, Textarea } from './FormControls';
import { TrashIcon, SpinnerIcon } from './icons';

interface CharacterFormProps {
  character: Character;
  index: number;
  updateCharacter: (id: string, field: keyof Character, value: any) => void;
  removeCharacter: (id: string) => void;
  handleImageUpload: (id: string, file: File | null) => void;
  handleClothingImageUpload: (id: string, file: File | null) => void;
  isGeneratingPreview: boolean;
}

const CharacterForm: React.FC<CharacterFormProps> = ({ 
  character, 
  index, 
  updateCharacter, 
  removeCharacter, 
  handleImageUpload, 
  handleClothingImageUpload,
  isGeneratingPreview
}) => {
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(character.id, e.target.files[0]);
    } else {
      handleImageUpload(character.id, null);
    }
  };

  const onClothingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleClothingImageUpload(character.id, e.target.files[0]);
    } else {
      handleClothingImageUpload(character.id, null);
    }
  };
  
  return (
    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 mb-4 relative">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-md font-semibold text-indigo-400">Karakter {index + 1}</h4>
        <button
          onClick={() => removeCharacter(character.id)}
          className="p-1 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
          aria-label="Remove Character"
        >
          <TrashIcon />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <Input
          id={`char-name-${character.id}`}
          label="Nama Karakter"
          value={character.name}
          onChange={(e) => updateCharacter(character.id, 'name', e.target.value)}
          placeholder="Contoh: Alice"
        />
        <Input
          id={`char-nationality-${character.id}`}
          label="Kewarganegaraan"
          value={character.nationality}
          onChange={(e) => updateCharacter(character.id, 'nationality', e.target.value)}
          placeholder="Contoh: Jepang"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label htmlFor={`char-image-${character.id}`} className="block text-sm font-medium text-gray-400 mb-1">
                Upload Gambar Referensi
            </label>
            <input
                id={`char-image-${character.id}`}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
            />
            {character.referenceImage?.data && (
                <div className="mt-2 flex items-center gap-2">
                    <img src={character.referenceImage.data} alt="Reference Preview" className="h-16 w-16 object-cover rounded-md"/>
                    <span className="text-xs text-gray-400 truncate">{character.referenceImage.name}</span>
                </div>
            )}
        </div>
        <div>
            <label htmlFor={`char-clothing-image-${character.id}`} className="block text-sm font-medium text-gray-400 mb-1">
                Upload Gambar Referensi Pakaian
            </label>
             <p className="text-xs text-gray-500 -mt-1 mb-2">Unggah gambar pakaian, kostum, atau seragam spesifik.</p>
            <input
                id={`char-clothing-image-${character.id}`}
                type="file"
                accept="image/*"
                onChange={onClothingFileChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
            />
            {character.clothingReferenceImage?.data && (
                <div className="mt-2 flex items-center gap-2">
                    <img src={character.clothingReferenceImage.data} alt="Clothing Reference Preview" className="h-16 w-16 object-cover rounded-md"/>
                    <span className="text-xs text-gray-400 truncate">{character.clothingReferenceImage.name}</span>
                </div>
            )}
        </div>
      </div>

      <Textarea
        id={`char-characteristics-${character.id}`}
        label="Karakteristik Subjek"
        value={character.characteristics}
        onChange={(e) => updateCharacter(character.id, 'characteristics', e.target.value)}
        placeholder="Contoh: Pria paruh baya, rambut pirang, tinggi"
        rows={2}
      />
      <Textarea
        id={`char-clothing-${character.id}`}
        label="Pakaian"
        value={character.clothing}
        onChange={(e) => updateCharacter(character.id, 'clothing', e.target.value)}
        placeholder="Jelaskan sedetail mungkin: baju, celana, sepatu, aksesoris."
        rows={2}
      />
      <Input
        id={`char-action-${character.id}`}
        label="Aksi Utama"
        value={character.mainAction}
        onChange={(e) => updateCharacter(character.id, 'mainAction', e.target.value)}
        placeholder="Contoh: Berlari di taman"
      />
      <Input
        id={`char-emotion-${character.id}`}
        label="Emosi"
        value={character.emotion}
        onChange={(e) => updateCharacter(character.id, 'emotion', e.target.value)}
        placeholder="Contoh: Senang, cemas, terkejut"
      />
      <div className="mt-4 pt-4 border-t border-gray-600 min-h-[140px] flex flex-col">
        <h5 className="text-sm font-semibold text-gray-300 mb-2">Pratinjau Karakter (AI)</h5>
        <div className="flex-grow flex items-center justify-center">
            {isGeneratingPreview ? (
                <div className="flex items-center gap-2 text-gray-400">
                    <SpinnerIcon className="w-5 h-5 animate-spin" />
                    <span>Membuat pratinjau...</span>
                </div>
            ) : character.previewImageUrl || character.previewDescription ? (
                <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
                    {character.previewImageUrl && (
                        <img 
                            src={character.previewImageUrl} 
                            alt={`Pratinjau AI untuk ${character.name || 'karakter'}`} 
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md border-2 border-gray-600 flex-shrink-0"
                        />
                    )}
                    {character.previewDescription && (
                        <p className="text-sm text-gray-400 italic">
                            "{character.previewDescription}"
                        </p>
                    )}
                </div>
            ) : (
                <div className="text-center text-sm text-gray-500 italic p-4">
                    <p>Isi 'Karakteristik Subjek' atau 'Pakaian' untuk membuat pratinjau secara otomatis.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CharacterForm;