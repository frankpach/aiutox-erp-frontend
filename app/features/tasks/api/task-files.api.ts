/**
 * Task Files API
 * API client for task file attachments
 * Sprint 3 - Fase 2
 */

import apiClient from '~/lib/api/client';

interface StandardResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

interface StandardListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  message?: string;
}

export interface TaskFileAttachment {
  file_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  attached_at: string;
  attached_by: string;
}

/**
 * Adjuntar archivo a tarea
 */
export async function attachFileToTask(
  taskId: string,
  fileId: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  fileUrl: string
): Promise<StandardResponse<TaskFileAttachment>> {
  console.warn('*** attachFileToTask API called ***');
  console.warn('taskId:', taskId);
  console.warn('fileId:', fileId);
  console.warn('fileName:', fileName);
  console.warn('fileSize:', fileSize);
  console.warn('fileType:', fileType);
  console.warn('fileUrl:', fileUrl);
  
  const params = new URLSearchParams();
  params.append('file_id', fileId);
  params.append('file_name', fileName);
  params.append('file_size', fileSize.toString());
  params.append('file_type', fileType);
  params.append('file_url', fileUrl);

  const fullUrl = `/tasks/${taskId}/files?${params.toString()}`;
  console.warn('Full URL:', fullUrl);

  try {
    console.warn('=== Calling apiClient.post ===');
    const response = await apiClient.post(fullUrl, {}, {
      timeout: 60000 // Aumentar timeout a 60 segundos
    });
    console.warn('=== attachFileToTask response ===');
    console.warn('Response:', response);
    console.warn('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== attachFileToTask error ===');
    console.error('Error:', error);
    throw error;
  }
}

/**
 * Desadjuntar archivo de tarea
 */
export async function detachFileFromTask(
  taskId: string,
  fileId: string
): Promise<void> {
  console.warn('*** NUEVA VERSIÓN 2.0 *** detachFileFromTask API called with:', { taskId, fileId });
  console.warn('Full URL:', `/tasks/${taskId}/files/${fileId}`);
  
  // Verificar que apiClient existe
  console.warn('=== CHECKING API CLIENT ===');
  console.warn('apiClient exists:', !!apiClient);
  console.warn('apiClient.delete exists:', typeof apiClient.delete === 'function');
  
  // Intentar primero con fetch directamente para descartar problemas con Axios
  try {
    console.warn('=== TRYING WITH FETCH DIRECT ===');
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8000/api/v1/tasks/${taskId}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.warn('=== FETCH RESPONSE ===');
    console.warn('Status:', response.status);
    console.warn('StatusText:', response.statusText);
    
    if (response.status === 204) {
      console.warn('=== FETCH SUCCESS: FILE DELETED ===');
      return;
    }
    
    throw new Error(`Fetch failed with status ${response.status}`);
  } catch (fetchError) {
    console.error('=== FETCH ERROR ===');
    console.error('Fetch error:', fetchError);
    
    // Si fetch falla, intentar con Axios
    console.warn('=== FALLING BACK TO AXIOS ===');
    
    try {
      console.warn('=== CALLING API CLIENT DELETE ===');
      const response = await apiClient.delete(`/tasks/${taskId}/files/${fileId}`);
      console.warn('=== API CLIENT DELETE RESPONSE ===');
      console.warn('detachFileFromTask API response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      console.warn('detachFileFromTask API success');
    } catch (error) {
      console.error('=== API CLIENT DELETE ERROR ===');
      console.error('detachFileFromTask API error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; statusText: string; data: unknown } };
        console.error('Error response:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data
        });
      }
      throw error;
    }
  }
}

/**
 * Listar archivos de tarea
 */
export async function listTaskFiles(
  taskId: string
): Promise<StandardListResponse<TaskFileAttachment>> {
  const response = await apiClient.get(`/tasks/${taskId}/files`);
  return response.data;
}
