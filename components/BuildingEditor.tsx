import React, { useRef } from 'react';
import type { Building } from '@/lib/types';
import Image from 'next/image';
import { uploadBuildingImage, getBuildingImageUrl } from '@/lib/api';

interface BuildingEditorProps {
  building: Building | null;
  onSave: (building: Building) => void;
  onCancel: () => void;
  onDelete?: (buildingId: string) => void;
}

export default function BuildingEditor({ building, onSave, onCancel, onDelete }: BuildingEditorProps) {
  const [formData, setFormData] = React.useState<Building>({
    id: building?.id || `building-${Date.now()}`,
    name: building?.name || '',
    department: building?.department || '',
    description: building?.description || '',
    image: building?.image || '',
    coordinates: building?.coordinates || { lat: 0, lng: 0 },
  });
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    building?.image ? getBuildingImageUrl(building.slug || building.id) : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save the basic building information
    const savedBuilding = await onSave(formData);
    
    // If we have a new image and the building has been saved successfully
    if (imageFile && savedBuilding && savedBuilding.slug) {
      try {
        // Upload the image
        await uploadBuildingImage(savedBuilding.slug, imageFile);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const isNewBuilding = !building?.id;

  return (
    <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-[9999] p-6 bg-white rounded-lg shadow-2xl w-96">
      <h2 className="text-xl font-bold mb-4">{isNewBuilding ? 'Add New Building' : 'Edit Building'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Building Name
          </label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="department">
            Department/Usage
          </label>
          <input 
            type="text" 
            id="department" 
            name="department" 
            value={formData.department} 
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description" 
            name="description" 
            value={formData.description || ''} 
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Building Image
          </label>
          <div 
            onClick={handleImageUploadClick}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
          >
            {imagePreview ? (
              <div className="relative h-40 w-full mb-2">
                <Image 
                  src={imagePreview} 
                  alt="Building preview" 
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  Click to upload an image
                </p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Coordinates (click on map to update)
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={formData.coordinates.lat.toFixed(6)} 
              readOnly
              className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 bg-gray-100"
            />
            <input 
              type="text" 
              value={formData.coordinates.lng.toFixed(6)} 
              readOnly
              className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 bg-gray-100"
            />
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          
          {!isNewBuilding && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(formData.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Delete
            </button>
          )}
          
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isNewBuilding ? 'Add Building' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 