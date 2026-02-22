import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ArticoloService } from '../../services/articolo.service';

@Component({
    selector: 'app-sottomissione-articolo',
    templateUrl: './sottomissione-articolo.page.html',
    styleUrls: ['./sottomissione-articolo.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent]
})
export class SottomissioneArticoloPage implements OnInit {
    @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

    titolo       = '';
    topic        = '';
    selectedFile: File | null = null;
    isDragOver   = false;
    fileError    = false;
    submitError  = '';
    showSuccess  = false;
    loading      = false;

    private token        = localStorage.getItem('token') ?? '';
    private idConferenza = '';

    constructor(
        private route:          ActivatedRoute,
        private router:         Router,
        private articoloService: ArticoloService
    ) {}

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }

        const id = this.route.snapshot.queryParamMap.get('id');
        if (!id) { this.router.navigate(['/dashboard-autore']); return; }
        this.idConferenza = id;
    }

    get confirmEnabled(): boolean {
        return this.titolo.trim() !== '' && this.topic.trim() !== '' && this.selectedFile !== null;
    }

    // ── File input ────────────────────────────────────────────
    openFilePicker(): void {
        this.fileInputRef.nativeElement.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) this.processFile(input.files[0]);
    }

    // ── Drag & drop ───────────────────────────────────────────
    onDragOver(event: DragEvent): void {
        event.preventDefault();
        this.isDragOver = true;
    }

    onDragLeave(): void {
        this.isDragOver = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        this.isDragOver = false;
        const files = event.dataTransfer?.files;
        if (files?.length) this.processFile(files[0]);
    }

    // ── Validazione file ──────────────────────────────────────
    processFile(file: File): void {
        const MAX_SIZE = 16 * 1024 * 1024;
        if (file.type !== 'application/pdf' || file.size > MAX_SIZE) {
            this.fileError    = true;
            this.selectedFile = null;
            return;
        }
        this.fileError    = false;
        this.selectedFile = file;
    }

    removeFile(): void {
        this.selectedFile = null;
        this.fileInputRef.nativeElement.value = '';
    }

    fileSizeMB(): string {
        return this.selectedFile ? (this.selectedFile.size / (1024 * 1024)).toFixed(1) : '0';
    }

    // ── Invio ─────────────────────────────────────────────────
    submit(): void {
        if (!this.confirmEnabled || this.loading) return;
        this.submitError = '';
        this.loading     = true;

        this.articoloService.sottometti(
            this.token, this.idConferenza,
            this.titolo.trim(), this.topic.trim(),
            this.selectedFile!
        ).subscribe({
            next: () => {
                this.loading     = false;
                this.showSuccess = true;
            },
            error: (err) => {
                this.submitError = err.error?.message ?? 'Errore durante la sottomissione. Riprova.';
                this.loading     = false;
            }
        });
    }

    annulla(): void { this.router.navigate(['/dashboard-autore']); }
}
