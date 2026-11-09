import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

/**
 * Aceita o gabarito oficial em dois formatos:
 *  - Objeto legado:  {"1": "A", "2": "B", ...}
 *  - Lista de questões: [{ numero: 1, alternativa: "A" }, ...]
 *
 * Por que não usar @IsObject? No class-validator >= 0.14, isObject() rejeita
 * arrays explicitamente (`!Array.isArray(value)`), o que quebraria o formato
 * novo de envio da lista de questões do gabarito.
 */
export const IS_GABARITO_INPUT = 'isGabaritoInput';

export function isGabaritoInput(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return true;
  return typeof value === 'object';
}

export function IsGabaritoInput(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_GABARITO_INPUT,
      validator: {
        validate: (value): boolean => isGabaritoInput(value),
        defaultMessage: buildMessage(
          () =>
            'O gabarito oficial deve ser um objeto {"1": "A", ...} ou uma lista de questões [{ numero: 1, alternativa: "A" }, ...]',
        ),
      },
    },
    validationOptions,
  );
}
