import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RatingStars from '../../components/RatingStars';

describe('RatingStars', () => {
    it('alapértelmezetten 5 üres csillagot renderel (value=0)', () => {
        const { container } = render(<RatingStars value={0} />);
        const stars = container.querySelectorAll('svg');
        expect(stars).toHaveLength(5);
    });

    it('5/5 esetén 5 teli csillagot mutat', () => {
        render(<RatingStars value={5} outOf={5} />);
        // Az MUI StarIcon data-testid-je "StarIcon", a többi "StarBorderIcon" / "StarHalfIcon"
        expect(screen.getAllByTestId('StarIcon')).toHaveLength(5);
    });

    it('3/5 esetén 3 teli és 2 üres csillagot mutat', () => {
        render(<RatingStars value={3} outOf={5} />);
        expect(screen.getAllByTestId('StarIcon')).toHaveLength(3);
        expect(screen.getAllByTestId('StarBorderIcon')).toHaveLength(2);
    });

    it('fél csillagot helyesen jeleníti meg (pl. 3.5)', () => {
        render(<RatingStars value={3.5} outOf={5} />);
        expect(screen.getAllByTestId('StarIcon')).toHaveLength(3);
        expect(screen.getAllByTestId('StarHalfIcon')).toHaveLength(1);
        expect(screen.getAllByTestId('StarBorderIcon')).toHaveLength(1);
    });

    it('negatív érték esetén minden csillag üres', () => {
        render(<RatingStars value={-1} outOf={5} />);
        expect(screen.getAllByTestId('StarBorderIcon')).toHaveLength(5);
        expect(screen.queryByTestId('StarIcon')).toBeNull();
    });

    it('outOf értéknek megfelelő számú csillagot renderel', () => {
        const { container } = render(<RatingStars value={2} outOf={10} />);
        const stars = container.querySelectorAll('svg');
        expect(stars).toHaveLength(10);
    });
});