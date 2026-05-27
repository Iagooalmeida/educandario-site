/**
 * Supabase Document Service
 * Handles document uploads/downloads using Supabase Storage
 * while keeping Firestore for metadata
 */

import {
  collection,
  doc,
  setDoc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import type {
  DocumentMetadata,
  DocumentFilter,
  UploadProgress,
  UploadDocumentInput,
} from '@/services/api/documents';
import { DocumentServiceError } from '@/services/api/documents';
import { firestore } from '@/services/firebase/config';
import { firebaseAuthService } from '@/services/firebase/auth';
import { firebaseDocumentService } from '@/services/firebase/documents';
import { storageService } from './storage';

export class SupabaseDocumentService {
  private readonly documentsCollection = 'documents';
  private readonly auditLogsCollection = 'audit_logs';

  private async getCurrentUser() {
    const user = await firebaseAuthService.getCurrentUser();
    if (!user) {
      throw new DocumentServiceError(
        'Usuário não autenticado',
        'AUTH_REQUIRED'
      );
    }
    return user;
  }

  private async logAuditAction(
    action: string,
    documentId: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const user = await firebaseAuthService.getCurrentUser();
      
      await addDoc(collection(firestore, this.auditLogsCollection), {
        documentId,
        action,
        userId: user?.id || 'unknown',
        userEmail: user?.email || 'unknown',
        timestamp: Timestamp.now(),
        details: details || {},
      });
    } catch (error) {
      console.warn('Failed to log audit action:', error);
    }
  }

  /**
   * Upload document to Supabase Storage
   * Saves metadata to Firestore ONLY (no Firebase Storage upload)
   */
  async uploadDocument(
    file: File,
    metadata: UploadDocumentInput,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DocumentMetadata> {
    const user = await this.getCurrentUser();

    try {
      // Upload file to Supabase Storage
      const { path: storagePath, url: fileUrl } = await storageService.uploadFile(
        file,
        file.name,
        { folder: 'documents' }
      );

      // Report progress
      onProgress?.({
        currentProgress: 100,
        totalBytes: file.size,
        uploadedBytes: file.size,
      });

      // Create document reference
      const docRef = doc(collection(firestore, this.documentsCollection));
      const documentId = docRef.id;

      // Prepare document metadata for Firestore
      const documentData: DocumentMetadata = {
        id: documentId,
        name: metadata.name || file.name,
        fileUrl: fileUrl, // Use Supabase URL
        storagePath: storagePath, // Store Supabase path for deletion
        uploadedBy: user.id,
        uploadedAt: Timestamp.now() as any,
        type: file.type.includes('pdf') ? 'pdf' : 'document',
        size: file.size,
        tags: metadata.tags || [],
        category: metadata.category || 'Geral',
        public: metadata.public !== false,
        description: metadata.description || '',
      };

      // Save metadata to Firestore
      await setDoc(docRef, documentData);

      // Log audit action
      await this.logAuditAction('upload', documentId, {
        fileName: file.name,
        fileSize: file.size,
        supabasePath: storagePath,
      });

      return documentData;
    } catch (error) {
      console.error('Supabase document upload error:', error);
      throw new DocumentServiceError(
        'Failed to upload document',
        'UPLOAD_FAILED',
        {
          message: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  /**
   * List documents from Firestore
   */
  async listDocuments(filter?: DocumentFilter) {
    return firebaseDocumentService.listDocuments(filter);
  }

  /**
   * Get document metadata
   */
  async getDocumentMetadata(documentId: string) {
    return firebaseDocumentService.getDocumentMetadata(documentId);
  }

  /**
   * Get document URL from Supabase
   */
  async getDocumentURL(documentId: string): Promise<string> {
    try {
      const metadata = await firebaseDocumentService.getDocumentMetadata(
        documentId
      );

      // If fileUrl exists, use it (Supabase URL)
      if (metadata.fileUrl) {
        return metadata.fileUrl;
      }

      // Fallback to Firebase Storage
      return firebaseDocumentService.getDocumentURL(documentId);
    } catch (error) {
      console.error('Get document URL error:', error);
      throw new DocumentServiceError(
        'Failed to get document URL',
        'URL_FETCH_FAILED',
        {
          message: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  /**
   * Delete document from Supabase Storage and Firestore
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      // Get metadata to find the storage path
      const metadata = await firebaseDocumentService.getDocumentMetadata(
        documentId
      );

      // Delete from Supabase Storage if path exists
      if (
        metadata.storagePath &&
        typeof metadata.storagePath === 'string'
      ) {
        try {
          await storageService.deleteFile(metadata.storagePath);
        } catch (storageError) {
          console.warn('Failed to delete from Supabase Storage:', storageError);
          // Continue with Firestore deletion even if Storage fails
        }
      }

      // Delete metadata from Firestore
      await firebaseDocumentService.deleteDocument(documentId);
    } catch (error) {
      console.error('Supabase document delete error:', error);
      throw new DocumentServiceError(
        'Failed to delete document',
        'DELETE_FAILED',
        {
          message: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    documentId: string,
    updates: Partial<
      Omit<DocumentMetadata, 'id' | 'uploadedBy' | 'uploadedAt'>
    >
  ) {
    return firebaseDocumentService.updateDocument(documentId, updates);
  }

  /**
   * Search documents
   */
  async searchDocuments(query: string) {
    return firebaseDocumentService.searchDocuments(query);
  }
}

export const supabaseDocumentService = new SupabaseDocumentService();
export default supabaseDocumentService;
