/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useMutation } from '@tanstack/react-query';
import { type StudentProfile } from '../declarations/studentWallBackend/studentWallBackend.did';
import { useAuth } from '../contexts/AuthContext';

export function useUpdateProfile() {
  const { backendActor } = useAuth();

  const updateProfile = async (newProfile: StudentProfile) => {
    return backendActor != null
      ? await backendActor.updateMyProfile(newProfile)
      : await Promise.reject(new Error('User not authenticated'));
  };

  return useMutation({
    mutationFn: updateProfile,
  });
}
