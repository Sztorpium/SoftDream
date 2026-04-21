import { describe, it, expect } from 'vitest';
import {
    translateRoomType,
    translateRoomStatus,
    translateBookingStatus,
    translateRole,
} from '../../utils/displayText';

describe('translateRoomType', () => {
    it('ismert típusokat magyarra fordít', () => {
        expect(translateRoomType('SINGLE')).toBe('Egyágyas');
        expect(translateRoomType('DOUBLE')).toBe('Kétágyas');
        expect(translateRoomType('TRIPLE')).toBe('Háromágyas');
        expect(translateRoomType('SUITE')).toBe('Lakosztály');
        expect(translateRoomType('PENTHOUSE')).toBe('Penthouse');
    });

    it('kis- és nagybetűtől független', () => {
        expect(translateRoomType('single')).toBe('Egyágyas');
        expect(translateRoomType('Double')).toBe('Kétágyas');
    });

    it('ismeretlen értéket változtatás nélkül adja vissza', () => {
        expect(translateRoomType('UNKNOWN')).toBe('UNKNOWN');
    });

    it('null/undefined esetén "—" visszaadása', () => {
        expect(translateRoomType(null)).toBe('—');
        expect(translateRoomType(undefined)).toBe('—');
    });
});

describe('translateRoomStatus', () => {
    it('ismert státuszokat magyarra fordít', () => {
        expect(translateRoomStatus('AVAILABLE')).toBe('Elérhető');
        expect(translateRoomStatus('BOOKED')).toBe('Foglalt');
        expect(translateRoomStatus('MAINTENANCE')).toBe('Karbantartás alatt');
    });

    it('ismeretlen értéket változtatás nélkül adja vissza', () => {
        expect(translateRoomStatus('SOMETHING_ELSE')).toBe('SOMETHING_ELSE');
    });

    it('null/undefined esetén "—" visszaadása', () => {
        expect(translateRoomStatus(null)).toBe('—');
        expect(translateRoomStatus(undefined)).toBe('—');
    });
});

describe('translateBookingStatus', () => {
    it('ismert státuszokat magyarra fordít', () => {
        expect(translateBookingStatus('PENDING')).toBe('Függőben');
        expect(translateBookingStatus('CONFIRMED')).toBe('Megerősítve');
        expect(translateBookingStatus('CANCELLED')).toBe('Lemondva');
    });

    it('ismeretlen értéket változtatás nélkül adja vissza', () => {
        expect(translateBookingStatus('EXPIRED')).toBe('EXPIRED');
    });

    it('null/undefined esetén "—" visszaadása', () => {
        expect(translateBookingStatus(null)).toBe('—');
        expect(translateBookingStatus(undefined)).toBe('—');
    });
});

describe('translateRole', () => {
    it('ismert szerepköröket magyarra fordít', () => {
        expect(translateRole('ADMIN')).toBe('Adminisztrátor');
        expect(translateRole('USER')).toBe('Felhasználó');
    });

    it('kis- és nagybetűtől független', () => {
        expect(translateRole('admin')).toBe('Adminisztrátor');
        expect(translateRole('user')).toBe('Felhasználó');
    });

    it('ismeretlen értéket változtatás nélkül adja vissza', () => {
        expect(translateRole('MODERATOR')).toBe('MODERATOR');
    });

    it('null/undefined esetén "—" visszaadása', () => {
        expect(translateRole(null)).toBe('—');
        expect(translateRole(undefined)).toBe('—');
    });
});